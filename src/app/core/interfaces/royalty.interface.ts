import { RoyaltyStatusType } from './royalty-status.interface';

export interface Royalty {
  id: number;
  amount: number;
  period: string;
  trackId: number;
  artistId: number;
  track?: { id: number; title: string };
  artist?: { id: number; name: string; email?: string };
}
