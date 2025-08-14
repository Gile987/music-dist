export interface UserProfile {
  //
  email: string;
  name: string;
  role: 'artist' | 'admin';
  createdAt: string;
  updatedAt: string;
}
