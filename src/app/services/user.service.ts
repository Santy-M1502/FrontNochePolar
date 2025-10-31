import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDto, User } from '../models/user.interface';
import { environment } from '../../enviroments/enviroment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient, private authService: AuthService) {}

  register(userData: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/usuarios/register`, userData);
  }

  uploadAvatar(file: File): Observable<User> {
    const token = this.authService.getToken();
    console.log('TOKEN A ENVIAR:', token); // 👈

    const formData = new FormData();
    formData.append('avatar', file);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<User>(`${this.apiUrl}/usuarios/upload-avatar`, formData, { headers });
  }
}