import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';


export interface PublicacionesPorUsuario {
  usuarioId: string;
  username: string;
  cantidad: number;
}

export interface ComentariosEnLapsoIntervalo {
  desde: string;
  hasta: string;
  count: number;
}

export interface ComentariosPorPublicacion {
  publicacionId: string;
  titulo: string;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private baseUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  publicacionesPorUsuario(desde: string, hasta: string): Observable<PublicacionesPorUsuario[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get<PublicacionesPorUsuario[]>(`${this.baseUrl}/estadisticas/publicaciones-por-usuario`, { params });
  }

  comentariosEnLapso(desde: string, hasta: string): Observable<ComentariosEnLapsoIntervalo[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get<ComentariosEnLapsoIntervalo[]>(`${this.baseUrl}/estadisticas/comentarios`, { params });
  }

  comentariosPorPublicacion(desde: string, hasta: string): Observable<ComentariosPorPublicacion[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get<ComentariosPorPublicacion[]>(`${this.baseUrl}/estadisticas/comentarios-por-publicacion`, { params });
  }
}
