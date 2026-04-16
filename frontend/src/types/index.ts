export interface ProjectFile {
  path: string;
  content: string;
}

export interface BuildResponse {
  session_id: string;
  status: string;
  success: boolean;
  output: string;
  files: Record<string, string>;
  evaluation: EvaluationResult[];
  evaluation_score?: number | null;
}

export interface EvaluationResult {
  file_path: string;
  score: number;
  feedback: string;
  issues: string[];
}

export interface Message {
  role: 'user' | 'agent';
  content: string;
  files?: Record<string, string>;
  output?: string;
  success?: boolean;
}
