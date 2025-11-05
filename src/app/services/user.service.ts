import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDto, User } from '../models/user.interface';
import { environment } from '../../enviroments/enviroment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient, private authService: AuthService) {}

  register(userData: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/usuarios/register`, userData);
  }

  registerWithAvatar(userData: any, file: File): Observable<User> {
    const formData = new FormData();
    Object.keys(userData).forEach((k) => {
      if (userData[k] !== undefined && userData[k] !== null) {
        formData.append(k, userData[k]);
      }
    });
    formData.append('avatar', file);

    return this.http.post<User>(`${this.apiUrl}/usuarios/register`, formData);
  }

  uploadAvatarForNewUser(userId: string, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = this.authService.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.post<User>(
      `${this.apiUrl}/usuarios/${userId}/avatar`,
      formData,
      headers ? { headers } : {}
    );
  }

  uploadAvatar(file: File): Observable<User> {
    const token = this.authService.getToken();
    console.log('🔑 Token usado en uploadAvatar:', token ? '(token presente)' : '❌ No hay token');

    const formData = new FormData();
    formData.append('avatar', file);

    // Log del contenido del FormData (solo nombre, no binario)
    for (const [key, value] of formData.entries()) {
      console.log('🧾 FormData ->', key, value instanceof File ? value.name : value);
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    console.log('📡 POST a:', `${this.apiUrl}/usuarios/upload-avatar`);

    return this.http.post<User>(
      `${this.apiUrl}/usuarios/upload-avatar`,
      formData,
      { headers }
    );
  }
}
