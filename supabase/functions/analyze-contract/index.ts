import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getSystemPrompt = (contractType: string, userRole: string) => `You are an expert contract attorney and legal analyst specializing in ${contractType} contracts. Your task is to provide a thorough, professional analysis of the provided contract from the perspective of a ${userRole}.

## Your Analysis Approach:

1. **Read the ENTIRE contract carefully** - Don't just skim, analyze every clause.

2. **Identify ALL risky or noteworthy clauses**, including but not limited to:
   - Liability limitations and indemnification clauses
   - Termination conditions and notice periods
   - Non-compete and non-solicitation provisions
   - Intellectual property assignments
   - Confidentiality and NDA terms
   - Payment terms, penalties, and late fees
   - Automatic renewal clauses
   - Dispute resolution and arbitration clauses
   - Force majeure provisions
   - Assignment and transfer restrictions
   - Warranty disclaimers
   - Governing law and jurisdiction

3. **For each flagged clause, provide**:
   - The EXACT text from the contract (quote it precisely)
   - A specific risk score from 0-10 based on:
     * 0-3: Low risk - standard terms, generally favorable
     * 4-6: Medium risk - terms that warrant attention or negotiation
     * 7-10: High risk - potentially harmful terms that should be negotiated or rejected
   - A clear, jargon-free explanation of WHY this clause is problematic for the ${userRole}
   - A specific, actionable suggestion for how to negotiate or modify the clause

4. **Calculate an overall risk score** considering:
   - Number and severity of risky clauses
   - Overall balance of the contract (one-sided vs. fair)
   - Industry standards for this type of contract
   - Potential financial and legal exposure

5. **Provide strategic tips and next steps** tailored to the ${userRole}'s situation:
   - Immediate action items based on findings
   - Negotiation strategies for high-risk clauses
   - Questions to ask the other party
   - Red flags that might warrant walking away
   - Professional resources that might help (lawyer, mediator, etc.)

## Response Format:
Respond ONLY with valid JSON, no markdown or additional text. Use this exact structure:

{
  "summary": "2-3 sentence executive summary of the contract and its key concerns",
  "overallRiskScore": <number 0-10>,
  "flaggedClauses": [
    {
      "id": "clause-1",
      "text": "<exact quoted text from contract>",
      "clauseType": "<type like 'Liability Limitation', 'Non-Compete', etc.>",
      "riskLevel": "<low|medium|high>",
      "riskScore": <number 0-10>,
      "explanation": "<plain language explanation of the risk>",
      "suggestion": "<specific negotiation advice>"
    }
  ],
  "nextSteps": {
    "immediateActions": ["<action 1>", "<action 2>", "<action 3>"],
    "negotiationTips": ["<tip 1>", "<tip 2>", "<tip 3>"],
    "questionsToAsk": ["<question 1>", "<question 2>"],
    "redFlags": ["<red flag if any>"],
    "professionalAdvice": "<when to seek professional help>"
  }
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractText, contractType, userRole, jurisdiction } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!contractText || contractText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "No contract text provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format contract type and user role for better prompts
    const formattedContractType = contractType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    const formattedUserRole = userRole.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

    const systemPrompt = getSystemPrompt(formattedContractType, formattedUserRole);

    const userPrompt = `Please analyze the following ${formattedContractType} contract. 

**Context:**
- I am a ${formattedUserRole}${jurisdiction ? ` located in ${jurisdiction}` : ""}
- I need to understand the risks before signing this contract
- Focus on clauses that could negatively impact me as the ${formattedUserRole}

**IMPORTANT INSTRUCTIONS:**
1. Quote the EXACT text from the contract for each clause you flag
2. Be thorough - identify at least 5-7 clauses worth reviewing if they exist
3. Prioritize high-risk items first
4. Provide specific, actionable negotiation advice
5. Consider ${jurisdiction ? `${jurisdiction} laws and regulations` : "general contract law principles"}

**CONTRACT TEXT:**
---
${contractText}
---

Analyze this contract now and return ONLY valid JSON with no markdown formatting.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a few moments." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response - handle potential markdown code blocks
    let analysisResult;
    try {
      let jsonStr = content;
      if (content.includes("```json")) {
        jsonStr = content.split("```json")[1].split("```")[0].trim();
      } else if (content.includes("```")) {
        jsonStr = content.split("```")[1].split("```")[0].trim();
      }
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse analysis results. Please try again.");
    }

    // Validate and ensure required fields exist
    if (!analysisResult.summary) {
      analysisResult.summary = "Contract analysis complete. Review the flagged clauses below for potential concerns.";
    }
    if (typeof analysisResult.overallRiskScore !== 'number') {
      analysisResult.overallRiskScore = 5;
    }
    if (!Array.isArray(analysisResult.flaggedClauses)) {
      analysisResult.flaggedClauses = [];
    }

    // Ensure each clause has all required fields
    analysisResult.flaggedClauses = analysisResult.flaggedClauses.map((clause: any, index: number) => ({
      id: clause.id || `clause-${index + 1}`,
      text: clause.text || "Clause text not available",
      clauseType: clause.clauseType || "General",
      riskLevel: clause.riskLevel || "medium",
      riskScore: typeof clause.riskScore === 'number' ? clause.riskScore : 5,
      explanation: clause.explanation || "Review this clause carefully.",
      suggestion: clause.suggestion || "Consider consulting with a legal professional.",
    }));

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
