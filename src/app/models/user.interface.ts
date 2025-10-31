export interface User {
  _id?: string;
  id?: string;
  sub?: string;
  username: string;
  profileImage?: string;
  cloudinaryPublicId?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}