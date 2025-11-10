import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publicacion, UpdatePublicacionDto } from '../models/publication.interface';
import { environment } from '../../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;

  crearPublicacion(
    data: { titulo?: string; texto: string },
    imagen?: File
  ): Observable<Publicacion> {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, v);
    });

    if (imagen) formData.append('imagen', imagen, imagen.name);

    return this.http.post<Publicacion>(`${this.apiUrl}/publicaciones`, formData);
  }
  
  actualizarPublicacion(id: string, body: UpdatePublicacionDto): Observable<Publicacion> {
    return this.http.patch<Publicacion>(`${this.apiUrl}/publicaciones/${id}`, body);
  }

  eliminarPublicacion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/publicaciones/${id}`);
  }

  darLike(publicacionId: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.apiUrl}/publicaciones/${publicacionId}/like`, {});
  }

  quitarLike(publicacionId: string): Observable<Publicacion> {
    return this.http.delete<Publicacion>(`${this.apiUrl}/publicaciones/${publicacionId}/like`);
  }

  /** ✅ Ahora acepta offset */
  obtenerUltimas(limit: number = 5, offset: number = 0): Observable<Publicacion[]> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);

    return this.http.get<Publicacion[]>(`${this.apiUrl}/publicaciones/ultimas`, { params });
  }

  obtenerActivas(limit: number = 10, offset: number = 0): Observable<Publicacion[]> {
    const params = new HttpParams().set('limit', limit).set('offset', offset);
    return this.http.get<Publicacion[]>(`${this.apiUrl}/publicaciones/activas`, { params });
  }

  obtenerInactivas(limit: number = 10, offset: number = 0): Observable<Publicacion[]> {
    const params = new HttpParams().set('limit', limit).set('offset', offset);
    return this.http.get<Publicacion[]>(`${this.apiUrl}/publicaciones/inactivas`, { params });
  }

  obtenerPublicaciones(
    usuarioId?: string,
    username?: string,
    ordenarPor?: 'fecha' | 'likes',
    limit: number = 10,
    offset: number = 0,
    soloConImagen?: boolean
  ): Observable<Publicacion[]> {
    let params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);

    if (usuarioId) params = params.set('usuarioId', usuarioId);
    if (username) params = params.set('username', username);
    if (ordenarPor) params = params.set('ordenarPor', ordenarPor);
    if (soloConImagen) params = params.set('soloConImagen', true);

    return this.http.get<Publicacion[]>(`${this.apiUrl}/publicaciones`, { params });
  }

  obtenerTodasPublicaciones(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.apiUrl}/publicaciones`);
  }

  /** ✅ Ahora acepta offset */
  obtenerConImagen(limit: number = 10, offset: number = 0): Observable<Publicacion[]> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);

    return this.http.get<Publicacion[]>(`${this.apiUrl}/publicaciones/con-imagen`, { params });
  }

  obtenerPublicacionesPaginadas(limit: number = 10, offset: number = 0): Observable<Publicacion[]> {
    const params = new HttpParams().set('limit', limit).set('offset', offset);
    return this.http.get<Publicacion[]>(`${this.apiUrl}/publicaciones`, { params });
  }

  toggleLike(publicacionId: string) {
    return this.http.post<Publicacion>(`${this.apiUrl}/publicaciones/${publicacionId}/like`, {});
  }

  /** ✅ Ahora acepta offset */
  obtenerAntiguas(limit: number = 5, offset: number = 0): Observable<Publicacion[]> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);

    return this.http.get<Publicacion[]>(`${this.apiUrl}/publicaciones/antiguas`, { params });
  }

  buscar(q: string, limit: number = 10, offset: number = 0): Observable<Publicacion[]> {
    const params = new HttpParams()
      .set('q', q)
      .set('limit', limit)
      .set('offset', offset);

    return this.http.get<Publicacion[]>(`${this.apiUrl}/publicaciones/buscar`, { params });
  }
}
