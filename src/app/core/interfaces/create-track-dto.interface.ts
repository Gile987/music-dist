export interface CreateTrackDto {
  title: string;
  duration: number;
  releaseId: number;
  fileUrl: string;
  isrc?: string;
}