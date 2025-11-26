import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Comentario } from '../models/comentario.interface';
import { environment } from '../../enviroments/enviroment';
const DEFAULT_AVATAR = 'https://i.pravatar.cc/48?img=65';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private apiUrl = environment.API_URL;

  private _comentarios$ = new BehaviorSubject<Comentario[]>([]);
  comentarios$ = this._comentarios$.asObservable();

  constructor(private http: HttpClient) {}

  obtenerPorPublicacion(
    publicacionId: string,
    limit: number,
    offset: number,
    orden: 'recientes' | 'antiguos' | 'populares',
    token: string
  ): Observable<Comentario[]> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const url = `${this.apiUrl}/comentarios/publicacion/${publicacionId}?limit=${limit}&offset=${offset}&orden=${orden}`;

    return new Observable(observer => {
      this.http.get<{ total: number; comentarios: Comentario[] }>(url, { headers }).subscribe({
        next: (res) => {
          const comentarios = (res.comentarios || []).map(c => {
            const usuario = c.usuario || { _id: '', username: 'Desconocido' };
            return {
              ...c,
              usuario: {
                ...usuario,
                profileImage: usuario.profileImage || DEFAULT_AVATAR
              },
              likesCount: Array.isArray(c.likes) ? c.likes.length : (c.likesCount || 0)
            } as Comentario;
          });

          if (offset === 0) {
            this._comentarios$.next(comentarios);
          } else {
            const actuales = this._comentarios$.getValue();
            this._comentarios$.next([...actuales, ...comentarios]);
          }

          observer.next(comentarios);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  obtenerComentariosPorPublicacion2(publicacionId: string): Observable<Comentario[]> {
    const url = `${this.apiUrl}/comentarios/publicacion/${publicacionId}`;
    return this.http.get<Comentario[]>(url);
  }

  // Comentar una publicación
  comentarPublicacion(publicacionId: string, texto: string, token: string): Observable<Comentario> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const url = `${this.apiUrl}/comentarios/publicacion/${publicacionId}`;

    return new Observable(observer => {
      this.http.post<Comentario>(url, { texto }, { headers }).subscribe({
        next: (nuevo) => {
          const usuario = (nuevo.usuario as any) || { _id: '', username: 'Desconocido' };
          const nuevoNormalizado: Comentario = {
            ...nuevo,
            usuario: {
              ...usuario,
              profileImage: usuario.profileImage || DEFAULT_AVATAR
            },
            likesCount: Array.isArray((nuevo as any).likes) ? (nuevo as any).likes.length : (nuevo.likesCount || 0),
            liked: !!nuevo.liked
          };

          const actuales = this._comentarios$.getValue();
          this._comentarios$.next([nuevoNormalizado, ...actuales]);
          observer.next(nuevoNormalizado);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  // Dar like
  darLike(comentarioId: string, token: string): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const url = `${this.apiUrl}/comentarios/${comentarioId}/like`;
    return this.http.post(url, {}, { headers });
  }

  // Quitar like
  quitarLike(comentarioId: string, token: string): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const url = `${this.apiUrl}/comentarios/${comentarioId}/like`;
    return this.http.delete(url, { headers });
  }

  // Limpiar comentarios locales
  limpiarComentarios() {
    this._comentarios$.next([]);
  }

  obtenerComentariosPorPublicacion(publicacionId: string): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.apiUrl}/comentarios/publicacion/${publicacionId}`);
  }
}
