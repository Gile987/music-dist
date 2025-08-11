export interface SignedUrlResponse {
  url: string;
}

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  lengthComputable: boolean;
}
