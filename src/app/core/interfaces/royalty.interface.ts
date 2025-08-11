import { RoyaltyStatusType } from './royalty-status.interface';

export interface Royalty {
  id: number;
  title: string;
  streams: number;
  rate: number;
  total: number;
  status: RoyaltyStatusType;
  date: string;
}
