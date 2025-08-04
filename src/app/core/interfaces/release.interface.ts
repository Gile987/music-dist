export interface Release {
  id: number;
  title: string;
  status: 'active' | 'pending' | 'archived';
  releaseDate: string;
  streams: number;
}
