export interface SignedUrlResponse {
  url: string;
}

export interface FileMetadata {
  name: string;
  duration: number;
}

export interface UploadFormValue {
  title: string;
  releaseId: string;
  isrc: string;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
}
