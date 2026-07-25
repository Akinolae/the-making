export interface User {
  id: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}
