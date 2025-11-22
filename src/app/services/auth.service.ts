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
  private warningTimer: any = null;
  private expiryTimer: any = null;
  private apiUrl = environment.API_URL;
  private sessionTimer: any;
  private sessionWarningShown = false;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private sessionWarningSubject = new BehaviorSubject<boolean>(false);
  sessionWarning$ = this.sessionWarningSubject.asObservable();
  constructor(private http: HttpClient) {
    const expiresAt = localStorage.getItem('sessionExpiresAt');
    if (expiresAt) {
      this.scheduleTimersFromExpires(+expiresAt);
    }
  }

  setUser(user: User | null): void {
    this.currentUserSubject.next(user);
    if (user) {
      try { localStorage.setItem('user', JSON.stringify(user)); } catch {}
    } else {
      try { localStorage.removeItem('user'); } catch {}
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserInfo(): Observable<User> {
    const current = this.currentUserSubject.value;
    if (current) return of(current);

    return this.http.get<User>(`${this.apiUrl}/auth/profile`).pipe(
      tap(user => this.setUser(user))
    );
  }

  getUserId(): string | null {
    return this.currentUserSubject.value?._id || null;
  }

  getUsuarioPorId(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/usuarios/${id}`);
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response && response.access_token) {
            localStorage.setItem('token', response.access_token);
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

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/profile`);
  }

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

  startSessionTimer(sessionDurationMs = 10 * 60 * 1000, warningBeforeMs = 5 * 60 * 1000) {
    this.clearTimers();
    this.sessionWarningShown = false;

    const now = Date.now();
    const expiresAt = now + sessionDurationMs;
    localStorage.setItem('sessionExpiresAt', expiresAt.toString());

    console.log('⏱️ Iniciando timer de sesión:', sessionDurationMs, 'ms. Aviso a', warningBeforeMs, 'ms antes.');

    this.scheduleTimersFromExpires(expiresAt, warningBeforeMs);
  }

  private showSessionWarning() {
    if (this.sessionWarningShown) return;
    this.sessionWarningShown = true;

    console.log('⚠️ Quedan 5 minutos de sesión, mostrando modal');
    this.sessionWarningSubject.next(true);
  }

  refreshToken(): Observable<string> {
    const token = this.getToken();
    if (!token) {
      console.log('[AuthService] No hay token para refrescar');
      return of('');
    }

    console.log('[AuthService] Intentando refrescar token:', token);
    return this.http.post<{ access_token: string }>(
      `${this.apiUrl}/auth/refrescar`,
      { token }
    ).pipe(
      tap({
        next: (res) => {
          if (res?.access_token) {
            localStorage.setItem('token', res.access_token);
            console.log('[AuthService] Token refrescado exitosamente:', res.access_token);
          } else {
            console.warn('[AuthService] La respuesta no tiene access_token', res);
          }
        },
        error: (err) => {
          console.error('[AuthService] Error al refrescar token:', err);
          this.logout();
        }
      }),
      map(res => res?.access_token || '')
    );
  }

  extendSession() {
    console.log('✅ extendSession called');
    this.refreshToken().subscribe({
      next: (newToken) => {
        console.log('[AuthService] extendSession result token:', newToken);
        if (newToken) {
          // reprograma duración completa otra vez (10 minutos por defecto)
          const newExpires = Date.now() + 10 * 60 * 1000;
          localStorage.setItem('sessionExpiresAt', newExpires.toString());
          this.scheduleTimersFromExpires(newExpires);
        }
        // cerrar modal
        this.sessionWarningSubject.next(false);
        this.sessionWarningShown = false;
      },
      error: (err) => {
        console.error(err);
        // en caso de error, cerrar modal y logout si es necesario
        this.sessionWarningSubject.next(false);
      }
    });
  }

  endSession() {
    console.log('❌ endSession called -> logout');
    this.clearTimers();
    localStorage.removeItem('sessionExpiresAt');
    this.sessionWarningSubject.next(false);
    this.logout();
  }

  private scheduleTimersFromExpires(expiresAt: number, warningBeforeMs = 5 * 60 * 1000) {
    this.clearTimers();
    const now = Date.now();

    const timeUntilWarning = (expiresAt - warningBeforeMs) - now;
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilWarning <= 0) {
      // Si ya pasó el punto de advertencia, mostrar inmediatamente
      this.showSessionWarning();
    } else {
      this.warningTimer = setTimeout(() => this.showSessionWarning(), timeUntilWarning);
    }

    if (timeUntilExpiry <= 0) {
      // Si ya expiró, forzar logout
      console.log('⏳ Sesión ya expiró. Logout.');
      this.logout();
    } else {
      this.expiryTimer = setTimeout(() => {
        console.log('⏳ Sesión expirada (timeout)');
        this.logout();
      }, timeUntilExpiry);
    }
  }

  private clearTimers() {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }
  
}
