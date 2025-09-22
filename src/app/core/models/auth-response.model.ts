import { User } from "./user.model";

export interface AuthResponse {
  user: User;
  token: string;
  success: boolean;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
