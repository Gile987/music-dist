import { Release } from './release.interface';

export interface ReleaseCreateDto {
  title: string;
  releaseDate: string;
  status?: 'active' | 'pending' | 'archived';
  coverUrl?: string;
}
