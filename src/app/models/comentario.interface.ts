export interface Comentario {
  _id: string;
  usuario: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  texto: string;
  likesCount?: number;
  liked?: boolean;
  createdAt?: string;
  respuestas?: Comentario[];
}
