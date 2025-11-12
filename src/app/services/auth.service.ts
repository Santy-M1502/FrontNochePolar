import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse, LoginDto, User } from '../models/user.interface';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.API_URL;

  // estado reactivo del usuario actual
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) {
      // si hay token, intento cargar perfil desde backend
      this.loadUserProfile();
    }
  }

  // setea y emite el usuario (llamar cuando actualizas user desde cualquier sitio)
  setUser(user: User | null): void {
    this.currentUserSubject.next(user);
    if (user) {
      try { localStorage.setItem('user', JSON.stringify(user)); } catch {}
    } else {
      try { localStorage.removeItem('user'); } catch {}
    }
  }

  // devuelve valor actual
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // devuelve observable del user; si ya está cargado, retorno of(user)
  getUserInfo(): Observable<User> {
    const current = this.currentUserSubject.value;
    if (current) return of(current);

    return this.http.get<User>(`${this.apiUrl}/auth/profile`).pipe(
      tap(user => this.setUser(user))
    );
  }

  // id del usuario actual o null
  getUserId(): string | null {
    return this.currentUserSubject.value?._id || null;
  }

  // endpoint para traer usuario por id (lo tenías antes)
  getUsuarioPorId(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/usuarios/${id}`);
  }

  // login: guarda token y carga perfil
  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response && response.access_token) {
            localStorage.setItem('token', response.access_token);
            // luego de guardar token, cargo perfil
            this.loadUserProfile();
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    try { localStorage.removeItem('user'); } catch {}
    this.setUser(null);
  }

  // obtiene perfil desde backend
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/profile`);
  }

  // carga perfil y lo emite; si falla, hace logout
  private loadUserProfile(): void {
    this.getProfile().subscribe({
      next: (user) => this.setUser(user),
      error: () => this.logout()
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // helper para actualizar solo campos del usuario (opcional)
  updateCurrentUser(partial: Partial<User>) {
    const current = this.getCurrentUser();
    if (!current) return;
    const updated = { ...current, ...partial };
    this.setUser(updated);
  }
}
