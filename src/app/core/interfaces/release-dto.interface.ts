import { Release } from './release.interface';
import { ReleaseStatusType } from './release-status.interface';

export interface ReleaseCreateDto {
  title: string;
  releaseDate: string;
  status?: ReleaseStatusType;
  coverUrl?: string;
}
