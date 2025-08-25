import { Release } from './release.interface';

export interface ArtistWithData {
  id: number;
  name: string;
  email: string;
  role: string;
  releases: Release[];
  totalTracks: number;
  totalStreams: number;
}
