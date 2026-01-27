import { ContractAnalysis } from '@/types/contract';

interface ExportOptions {
  includeFullText?: boolean;
  includeNextSteps?: boolean;
}

export async function generatePDFReport(
  analysis: ContractAnalysis, 
  options: ExportOptions = {}
): Promise<void> {
  const { includeFullText = false, includeNextSteps = true } = options;

  const highRiskClauses = analysis.flaggedClauses.filter(c => c.riskLevel === 'high');
  const mediumRiskClauses = analysis.flaggedClauses.filter(c => c.riskLevel === 'medium');
  const lowRiskClauses = analysis.flaggedClauses.filter(c => c.riskLevel === 'low');

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const clauseHtml = analysis.flaggedClauses.map((clause, index) => `
    <div style="margin: 20px 0; padding: 16px; border-left: 4px solid ${getRiskColor(clause.riskLevel)}; background: #f9fafb; border-radius: 0 8px 8px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${index + 1}. ${clause.clauseType}</h3>
        <span style="background: ${getRiskColor(clause.riskLevel)}20; color: ${getRiskColor(clause.riskLevel)}; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
          ${clause.riskLevel} Risk (${clause.riskScore}/10)
        </span>
      </div>
      <div style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; font-style: italic; color: #374151; font-size: 14px; line-height: 1.6;">"${clause.text}"</p>
      </div>
      <div style="margin-bottom: 8px;">
        <p style="margin: 0 0 4px 0; font-weight: 600; color: #1f2937; font-size: 14px;">Why This Matters:</p>
        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">${clause.explanation}</p>
      </div>
      <div>
        <p style="margin: 0 0 4px 0; font-weight: 600; color: #1f2937; font-size: 14px;">Recommendation:</p>
        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">${clause.suggestion}</p>
      </div>
    </div>
  `).join('');

  const nextStepsHtml = analysis.nextSteps && includeNextSteps ? `
    <div style="margin-top: 40px; page-break-before: always;">
      <h2 style="color: #14332F; font-size: 20px; font-weight: 700; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #14332F;">
        📋 Recommended Next Steps
      </h2>
      
      ${analysis.nextSteps.immediateActions.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 12px;">🚨 Immediate Actions</h3>
          <ul style="margin: 0; padding-left: 24px; color: #4b5563;">
            ${analysis.nextSteps.immediateActions.map(action => `<li style="margin-bottom: 8px; line-height: 1.5;">${action}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${analysis.nextSteps.negotiationTips.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 12px;">💬 Negotiation Tips</h3>
          <ul style="margin: 0; padding-left: 24px; color: #4b5563;">
            ${analysis.nextSteps.negotiationTips.map(tip => `<li style="margin-bottom: 8px; line-height: 1.5;">${tip}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${analysis.nextSteps.questionsToAsk.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 12px;">❓ Questions to Ask</h3>
          <ul style="margin: 0; padding-left: 24px; color: #4b5563;">
            ${analysis.nextSteps.questionsToAsk.map(q => `<li style="margin-bottom: 8px; line-height: 1.5;">${q}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${analysis.nextSteps.redFlags.length > 0 ? `
        <div style="margin-bottom: 24px; padding: 16px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
          <h3 style="color: #dc2626; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">⚠️ Red Flags</h3>
          <ul style="margin: 0; padding-left: 24px; color: #7f1d1d;">
            ${analysis.nextSteps.redFlags.map(flag => `<li style="margin-bottom: 8px; line-height: 1.5;">${flag}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${analysis.nextSteps.professionalAdvice ? `
        <div style="padding: 16px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #16a34a;">
          <h3 style="color: #16a34a; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">👨‍⚖️ Professional Advice</h3>
          <p style="margin: 0; color: #166534; line-height: 1.5;">${analysis.nextSteps.professionalAdvice}</p>
        </div>
      ` : ''}
    </div>
  ` : '';

  const fullTextHtml = includeFullText && analysis.fullText ? `
    <div style="margin-top: 40px; page-break-before: always;">
      <h2 style="color: #14332F; font-size: 20px; font-weight: 700; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #14332F;">
        📄 Full Contract Text
      </h2>
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6; white-space: pre-wrap; color: #374151;">
        ${analysis.fullText}
      </div>
    </div>
  ` : '';

  const reportContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Contract Analysis Report - ${analysis.fileName}</title>
      <style>
        * { box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 40px;
          color: #1f2937;
          line-height: 1.6;
        }
        @media print { 
          body { margin: 0; padding: 20px; }
          .no-print { display: none; }
        }
        @page { margin: 2cm; }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #14332F;">
        <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #14332F 0%, #516559 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px;">🛡️</span>
          </div>
          <span style="font-size: 28px; font-weight: 700; color: #14332F;">ContractGuard</span>
        </div>
        <h1 style="margin: 0 0 8px 0; color: #14332F; font-size: 24px;">Contract Analysis Report</h1>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <!-- Document Info -->
      <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <div>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Document</p>
            <p style="margin: 0; font-weight: 600; color: #1f2937;">${analysis.fileName}</p>
          </div>
          <div>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Contract Type</p>
            <p style="margin: 0; font-weight: 600; color: #1f2937; text-transform: capitalize;">${analysis.contractType.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Your Role</p>
            <p style="margin: 0; font-weight: 600; color: #1f2937; text-transform: capitalize;">${analysis.userRole.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Jurisdiction</p>
            <p style="margin: 0; font-weight: 600; color: #1f2937;">${analysis.jurisdiction}</p>
          </div>
        </div>
      </div>

      <!-- Risk Score -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(${getRiskColor(analysis.overallRiskScore > 6 ? 'high' : analysis.overallRiskScore > 3 ? 'medium' : 'low')} ${analysis.overallRiskScore * 10}%, #e5e7eb ${analysis.overallRiskScore * 10}%); display: flex; align-items: center; justify-content: center; position: relative;">
          <div style="width: 100px; height: 100px; background: white; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="font-size: 32px; font-weight: 700; color: #1f2937;">${analysis.overallRiskScore}</span>
            <span style="font-size: 12px; color: #6b7280;">/10 Risk</span>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div style="background: linear-gradient(135deg, #14332F 0%, #516559 100%); padding: 24px; border-radius: 12px; margin-bottom: 30px;">
        <h2 style="margin: 0 0 12px 0; color: white; font-size: 18px; font-weight: 600;">Executive Summary</h2>
        <p style="margin: 0; color: rgba(255,255,255,0.9); line-height: 1.6;">${analysis.summary}</p>
      </div>

      <!-- Clause Summary -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px;">
        <div style="text-align: center; padding: 16px; background: #fef2f2; border-radius: 12px;">
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #dc2626;">${highRiskClauses.length}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #7f1d1d;">High Risk</p>
        </div>
        <div style="text-align: center; padding: 16px; background: #fffbeb; border-radius: 12px;">
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #d97706;">${mediumRiskClauses.length}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #92400e;">Medium Risk</p>
        </div>
        <div style="text-align: center; padding: 16px; background: #f0fdf4; border-radius: 12px;">
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #16a34a;">${lowRiskClauses.length}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #166534;">Low Risk</p>
        </div>
      </div>

      <!-- Flagged Clauses -->
      <div>
        <h2 style="color: #14332F; font-size: 20px; font-weight: 700; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #14332F;">
          🔍 Flagged Clauses (${analysis.flaggedClauses.length})
        </h2>
        ${clauseHtml}
      </div>

      ${nextStepsHtml}
      ${fullTextHtml}

      <!-- Footer -->
      <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
          Generated by ContractGuard AI Analysis
        </p>
        <p style="margin: 0; color: #9ca3af; font-size: 11px;">
          This report is for informational purposes only and does not constitute legal advice. 
          Please consult with a qualified attorney for specific legal guidance.
        </p>
      </div>
    </body>
    </html>
  `;

  // Open in new window for printing as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(reportContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

export function downloadAsWord(analysis: ContractAnalysis): void {
  const highRiskClauses = analysis.flaggedClauses.filter(c => c.riskLevel === 'high');
  const mediumRiskClauses = analysis.flaggedClauses.filter(c => c.riskLevel === 'medium');
  const lowRiskClauses = analysis.flaggedClauses.filter(c => c.riskLevel === 'low');

  const clauseHtml = analysis.flaggedClauses.map(clause => `
    <div style="margin: 16px 0; padding-left: 16px; border-left: 4px solid ${clause.riskLevel === 'high' ? '#dc2626' : clause.riskLevel === 'medium' ? '#d97706' : '#16a34a'};">
      <h3>${clause.clauseType} (${clause.riskLevel.toUpperCase()} RISK - Score: ${clause.riskScore}/10)</h3>
      <p><strong>Contract Text:</strong> "${clause.text}"</p>
      <p><strong>Issue:</strong> ${clause.explanation}</p>
      <p><strong>Recommendation:</strong> ${clause.suggestion}</p>
    </div>
  `).join('');

  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
      <head>
        <meta charset='utf-8'>
        <title>Contract Analysis Report - ${analysis.fileName}</title>
        <style>
          body { font-family: Calibri, sans-serif; }
          h1 { color: #14332F; }
          h2 { color: #14332F; border-bottom: 2px solid #14332F; padding-bottom: 8px; }
        </style>
      </head>
      <body>
        <h1>Contract Analysis Report</h1>
        <p><strong>Document:</strong> ${analysis.fileName}</p>
        <p><strong>Contract Type:</strong> ${analysis.contractType}</p>
        <p><strong>Analyzed:</strong> ${new Date(analysis.analyzedAt).toLocaleDateString()}</p>
        
        <h2>Overall Risk Score: ${analysis.overallRiskScore}/10</h2>
        <p>${analysis.summary}</p>
        
        <h2>Clause Summary</h2>
        <p>High Risk: ${highRiskClauses.length} | Medium Risk: ${mediumRiskClauses.length} | Low Risk: ${lowRiskClauses.length}</p>
        
        <h2>Flagged Clauses (${analysis.flaggedClauses.length} found)</h2>
        ${clauseHtml}
        
        <hr>
        <p><em>Generated by ContractGuard AI Analysis</em></p>
        <p><small>This report is for informational purposes only and does not constitute legal advice.</small></p>
      </body>
    </html>
  `;
  
  const blob = new Blob([content], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Contract_Analysis_${analysis.fileName.replace(/\.[^/.]+$/, '')}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}
