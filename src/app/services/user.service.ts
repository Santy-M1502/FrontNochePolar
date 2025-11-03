import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
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

  registerWithAvatar(userData: any, file: File): Observable<any> {
    const formData = new FormData();
    Object.keys(userData).forEach(k => formData.append(k, userData[k]));
    formData.append('avatar', file);

    return this.http.post<any>(`${this.apiUrl}/usuarios/register`, formData);
  }

  uploadAvatarForNewUser(userId: string, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = this.authService?.getToken?.() || null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.post<User>(
      `${this.apiUrl}/usuarios/${userId}/avatar`,
      formData,
      headers ? { headers } : {}
    );
  }

  uploadAvatar(file: File): Observable<User> {
    const token = this.authService.getToken();
    const formData = new FormData();
    formData.append('avatar', file);
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<User>(`${this.apiUrl}/usuarios/upload-avatar`, formData, { headers });
  }
}
