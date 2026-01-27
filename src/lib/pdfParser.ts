import { supabase } from '@/integrations/supabase/client';

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  method: 'native' | 'ocr' | 'fallback';
}

/**
 * Convert file to base64
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get just the base64 content
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extract text using native PDF parsing (for digital PDFs)
 */
function extractTextNatively(arrayBuffer: ArrayBuffer): { text: string; pageCount: number } {
  const uint8Array = new Uint8Array(arrayBuffer);
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const rawText = decoder.decode(uint8Array);
  
  let extractedText = '';
  
  // Method 1: Extract text from PDF text streams with better decoding
  const streamMatches = rawText.match(/stream[\s\S]*?endstream/g);
  if (streamMatches) {
    for (const match of streamMatches) {
      // Look for FlateDecode streams (most common in PDFs)
      const cleaned = match
        .replace(/stream|endstream/g, '')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Only include if it has substantial readable content
      if (cleaned.length > 20 && /[a-zA-Z]{3,}/.test(cleaned)) {
        extractedText += cleaned + '\n';
      }
    }
  }
  
  // Method 2: Extract text from Tj operators (PDF text commands)
  const tjMatches = rawText.match(/\(([^)]{2,})\)\s*Tj/g);
  if (tjMatches) {
    const tjText = tjMatches
      .map(m => {
        let text = m.replace(/\(|\)\s*Tj/g, '');
        // Decode PDF escape sequences
        text = text
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '')
          .replace(/\\t/g, '\t')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\');
        return text;
      })
      .filter(t => t.length > 1 && /[a-zA-Z]/.test(t))
      .join(' ');
    if (tjText.length > 10) {
      extractedText += '\n' + tjText;
    }
  }
  
  // Method 3: Extract text from TJ arrays (more common in modern PDFs)
  const tjArrayMatches = rawText.match(/\[([^\]]+)\]\s*TJ/gi);
  if (tjArrayMatches) {
    for (const match of tjArrayMatches) {
      const textParts = match.match(/\(([^)]*)\)/g);
      if (textParts) {
        const text = textParts
          .map(p => {
            let t = p.replace(/^\(|\)$/g, '');
            // Decode PDF escape sequences
            t = t
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '')
              .replace(/\\t/g, '\t')
              .replace(/\\\(/g, '(')
              .replace(/\\\)/g, ')')
              .replace(/\\\\/g, '\\')
              .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
            return t;
          })
          .join('');
        if (text.length > 2 && /[a-zA-Z]/.test(text)) {
          extractedText += text + ' ';
        }
      }
    }
  }
  
  // Method 4: Look for BT...ET blocks (text blocks in PDF)
  const textBlocks = rawText.match(/BT[\s\S]*?ET/g);
  if (textBlocks) {
    for (const block of textBlocks) {
      const texts = block.match(/\(([^)]+)\)/g);
      if (texts) {
        const blockText = texts
          .map(t => {
            let text = t.replace(/^\(|\)$/g, '');
            // Decode escape sequences
            text = text
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '')
              .replace(/\\\(/g, '(')
              .replace(/\\\)/g, ')');
            return text;
          })
          .filter(t => /[a-zA-Z]/.test(t))
          .join(' ');
        if (blockText.length > 5) {
          extractedText += blockText + '\n';
        }
      }
    }
  }
  
  // Estimate page count from PDF structure
  const pageMatches = rawText.match(/\/Type\s*\/Page[^s]/g);
  const pageCount = pageMatches ? pageMatches.length : 1;
  
  // Clean up the extracted text
  extractedText = extractedText
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
  
  // Remove duplicate content (common in PDF extraction)
  const lines = extractedText.split('\n');
  const uniqueLines = [...new Set(lines)];
  extractedText = uniqueLines.join('\n');
  
  return {
    text: extractedText,
    pageCount: Math.max(1, pageCount),
  };
}

/**
 * Check if extracted text is readable (not encrypted/garbled)
 */
function isTextReadable(text: string): boolean {
  if (text.length < 100) return false;
  
  // Check for reasonable word patterns
  const words = text.split(/\s+/).filter(w => w.length > 2);
  const readableWords = words.filter(w => /^[a-zA-Z]+$/.test(w));
  const readableRatio = readableWords.length / Math.max(1, words.length);
  
  // Check for common legal/contract terms
  const legalTerms = ['agreement', 'party', 'parties', 'shall', 'contract', 'terms', 'conditions', 'liability', 'payment', 'termination', 'clause', 'section', 'article', 'hereby', 'whereas', 'therefore'];
  const hasLegalTerms = legalTerms.some(term => text.toLowerCase().includes(term));
  
  // Text is readable if it has good ratio of readable words OR contains legal terms
  return readableRatio > 0.3 || (hasLegalTerms && readableRatio > 0.15);
}

/**
 * Extract text from a PDF file using native methods first, then OCR fallback
 */
export async function extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Step 1: Try native text extraction first (faster, works for digital PDFs)
    console.log('Attempting native PDF text extraction...');
    const nativeResult = extractTextNatively(arrayBuffer);
    
    // Check if the text is readable and substantial
    if (nativeResult.text.length > 100 && isTextReadable(nativeResult.text)) {
      console.log(`Native extraction successful: ${nativeResult.text.length} characters`);
      return {
        text: nativeResult.text,
        pageCount: nativeResult.pageCount,
        method: 'native',
      };
    }
    
    console.log('Native extraction yielded minimal content, using OCR...');
    
    // Step 2: Fall back to OCR using Gemini Vision API
    try {
      const base64 = await fileToBase64(file);
      
      const { data, error } = await supabase.functions.invoke('ocr-extract', {
        body: {
          pdfBase64: base64,
          fileName: file.name,
        },
      });
      
      if (error) {
        console.error('OCR error:', error);
        throw new Error(error.message || 'OCR extraction failed');
      }
      
      if (data?.text && data.text.length > 50) {
        console.log(`OCR extraction successful: ${data.text.length} characters`);
        return {
          text: data.text,
          pageCount: nativeResult.pageCount || Math.ceil(data.text.length / 3000),
          method: 'ocr',
        };
      }
    } catch (ocrError) {
      console.error('OCR fallback error:', ocrError);
    }
    
    // Step 3: Last resort - return whatever native extraction got with a warning
    if (nativeResult.text.length > 50) {
      return {
        text: nativeResult.text + '\n\n[Note: Text extraction may be incomplete. The document appears to be scanned or use complex encoding. Some content may be missing or garbled.]',
        pageCount: nativeResult.pageCount,
        method: 'fallback',
      };
    }
    
    return {
      text: 'Unable to extract readable text from this PDF. The document may be:\n\n' +
            '• A scanned document with low image quality\n' +
            '• Password protected or encrypted\n' +
            '• Using an unsupported encoding\n\n' +
            'Please try:\n' +
            '1. Converting the scanned PDF to a clearer image\n' +
            '2. Using a PDF with selectable text\n' +
            '3. Copying and pasting the text directly',
      pageCount: 1,
      method: 'fallback',
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      text: 'Error reading PDF file. Please ensure the file is not corrupted and try again.',
      pageCount: 1,
      method: 'fallback',
    };
  }
}
