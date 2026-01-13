export interface User {
  id?: number;
  name: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user?: User; // Depending on API response
  message?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
