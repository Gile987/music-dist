import { ReleaseStatusType } from './release-status.interface';

export interface Release {
  id: number;
  title: string;
  status: ReleaseStatusType;
  releaseDate: string;
  streams: number;
  coverUrl?: string;
}
