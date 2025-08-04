export interface Release {
  title: string;
  date: string;
  status: 'active' | 'pending' | 'archived';
}
