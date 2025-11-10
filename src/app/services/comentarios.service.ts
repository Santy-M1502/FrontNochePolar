import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comentario } from '../models/comentario.interface';
import { environment } from '../../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  obtenerPorPublicacion(
    publicacionId: string,
    limit: number,
    offset: number,
    orden: 'recientes' | 'antiguos' | 'populares'
  ): Observable<{ comentarios: Comentario[]; total: number }> {
    return this.http.get<{ comentarios: Comentario[]; total: number }>(
      `${this.apiUrl}/comentarios/publicacion/${publicacionId}?limit=${limit}&offset=${offset}&orden=${orden}`
    );
  }

  comentarPublicacion(publicacionId: string, texto: string): Observable<Comentario> {
    if (!texto?.trim()) throw new Error('Texto no puede estar vacío');
    return this.http.post<Comentario>(
      `${this.apiUrl}/comentarios/publicacion/${publicacionId}`,
      { texto }
    );
  }

  darLike(comentarioId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/comentarios/${comentarioId}/like`, {});
  }

  quitarLike(comentarioId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/comentarios/${comentarioId}/like`);
  }
}
