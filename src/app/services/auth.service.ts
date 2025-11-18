import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthResponse, LoginDto, User } from '../models/user.interface';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.API_URL;
  private sessionTimer: any;
  private sessionWarningShown = false;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private sessionWarningSubject = new BehaviorSubject<boolean>(false);
  sessionWarning$ = this.sessionWarningSubject.asObservable();
  constructor(private http: HttpClient) {
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
            // ahora pedimos el perfil del usuario con ese token
            this.loadUserProfile(); 
            this.startSessionTimer();
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
  loadUserProfile() {
    const token = this.getToken();
    if (!token) return;

    return this.http.get<User>(`${this.apiUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(user => {
      this.setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
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

  loadUserProfileFromStorage() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.setUser(user);
      return user;
    }
    return null;
  }

  startSessionTimer() {
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    this.sessionWarningShown = false;

    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutos

    // guardamos en localStorage para que el contador en vivo lo lea
    localStorage.setItem('sessionExpiresAt', expiresAt.toString());

    console.log('⏱️ Iniciando timer de sesión de 10 minutos');

    this.sessionTimer = setTimeout(() => {
      console.log('⏳ 10 minutos pasaron, mostrando advertencia de sesión');
      this.showSessionWarning();
    }, 10 * 60 * 1000);
  }

  private showSessionWarning() {
    if (this.sessionWarningShown) return;
    this.sessionWarningShown = true;

    console.log('⚠️ Quedan 5 minutos de sesión, preguntando si extender');
    
    const extend = confirm('⏰ Quedan 5 minutos de sesión. ¿Deseas extenderla?');

    if (extend) {
      console.log('✅ Usuario eligió extender la sesión');
      this.refreshToken();
    } else {
      console.log('❌ Usuario no extendió la sesión');
    }
  }

  refreshToken(): Observable<string> {
    const token = this.getToken();
    if (!token) {
      console.log('[AuthService] No hay token para refrescar');
      return of(''); // retorno vacío si no hay token
    }

    console.log('[AuthService] Intentando refrescar token:', token);

    return this.http.post<{ access_token: string }>(
      `${this.apiUrl}/auth/refrescar`,
      { token } // <-- enviar token en el body, como espera tu backend
    ).pipe(
      tap({
        next: (res) => {
          if (res.access_token) {
            localStorage.setItem('token', res.access_token);
            console.log('[AuthService] Token refrescado exitosamente:', res.access_token);
          } else {
            console.warn('[AuthService] La respuesta no tiene access_token', res);
          }
        },
        error: (err) => {
          console.error('[AuthService] Error al refrescar token:', err);
          this.logout(); // si falla, cerrar sesión
        }
      }),
      map(res => res.access_token) // para que el observable devuelva el nuevo token
    );
  }

  extendSession() {
    console.log('✅ extendSession called');
    this.refreshToken().subscribe({
      next: (newToken) => {
        // refreshToken ya reinicia startSessionTimer() en el tap
        console.log('[AuthService] extendSession result token:', newToken);
      },
      error: (err) => console.error(err)
    });
    this.sessionWarningSubject.next(false);
  }

  endSession() {
    console.log('❌ endSession called -> logout');
    this.logout();
    this.sessionWarningSubject.next(false);
  }
}
