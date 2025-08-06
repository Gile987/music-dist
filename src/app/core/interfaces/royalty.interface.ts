export interface Royalty {
  id: number;
  title: string;
  streams: number;
  rate: number;
  total: number;
  status: 'paid' | 'pending';
  date: string;
}
