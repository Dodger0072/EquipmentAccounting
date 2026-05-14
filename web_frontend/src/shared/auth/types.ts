export type Role = 'admin' | 'operator' | 'student';

export interface User {
  id: number;
  username: string;
  email: string | null;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
