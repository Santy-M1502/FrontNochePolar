import { Comentario } from './comentario.interface';
import { User } from './user.interface';

interface PublicacionAuthor {
  _id: string;
  username: string;
  profileImage?: string;
}

export interface Publicacion {
  _id: string;
  titulo?: string;
  texto: string;
  usuarioId: string;
  usuario?: { _id: string ,username: string; profileImage?: string };
  likes?: string[];
  liked?: boolean;
  likesCount?: number;
  imagenUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  comentarios?: Comentario[];
}

export interface PublicacionQuery {
  usuarioId?: string;
  username?: string;
  ordenarPor?: 'fecha' | 'likes';
  limit?: number;
  offset?: number;
  soloConImagen?: boolean;
}

export interface UpdatePublicacionDto {
  titulo?: string;
  texto?: string;
}