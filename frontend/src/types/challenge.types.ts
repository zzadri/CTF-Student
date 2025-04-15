export interface FlagValidationResponse {
  success: boolean;
  message: string;
  points?: number;
}

export interface FlagSubmissionStatus {
  loading: boolean;
  error: string | null;
  success: boolean;
  points?: number;
} 