export interface User {
  _id?: string;
  id?: string;
  sub?: string;
  username: string;
  profileImage?: string;
  cloudinaryPublicId?: string;
  descripcion?: string;
  followers?: number;
  following?: number;
}

export interface Friend {
  _id: string;
  username: string;
  profileImage?: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user:User;
}