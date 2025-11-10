import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class InteraccionesService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  toggleLike(usuarioId: string, publicacionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/interacciones/like/${usuarioId}/${publicacionId}`, {});
  }

  obtenerLikesDeUsuario(usuarioId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/interacciones/likes/${usuarioId}`);
  }

  toggleGuardado(usuarioId: string, publicacionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/interacciones/guardado/${usuarioId}/${publicacionId}`, {});
  }

  obtenerGuardadas(usuarioId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/interacciones/guardados/${usuarioId}`);
  }
}
