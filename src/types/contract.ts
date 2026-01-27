export type RiskLevel = 'low' | 'medium' | 'high';

export type ContractType = 
  | 'employment' 
  | 'rental' 
  | 'service' 
  | 'nda' 
  | 'sales' 
  | 'partnership'
  | 'freelance'
  | 'other';

export type UserRole = 
  | 'employee' 
  | 'tenant' 
  | 'contractor' 
  | 'consumer' 
  | 'business_owner'
  | 'landlord'
  | 'other';

export interface FlaggedClause {
  id: string;
  text: string;
  clauseType: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0-10
  explanation: string;
  suggestion: string;
  startIndex?: number;
  endIndex?: number;
}

export interface NextSteps {
  immediateActions: string[];
  negotiationTips: string[];
  questionsToAsk: string[];
  redFlags: string[];
  professionalAdvice: string;
}

export interface ContractAnalysis {
  id: string;
  fileName: string;
  contractType: ContractType;
  userRole: UserRole;
  jurisdiction: string;
  uploadedAt: Date;
  analyzedAt: Date;
  overallRiskScore: number; // 0-10
  summary: string;
  flaggedClauses: FlaggedClause[];
  fullText: string;
  pageCount: number;
  nextSteps?: NextSteps;
}

export interface AnalysisHistory {
  id: string;
  fileName: string;
  contractType: ContractType;
  overallRiskScore: number;
  analyzedAt: Date;
  clauseCount: number;
}

export interface UploadFormData {
  file: File | null;
  contractType: ContractType;
  userRole: UserRole;
  jurisdiction: string;
}
