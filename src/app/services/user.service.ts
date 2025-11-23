import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDto, User } from '../models/user.interface';
import { Friend } from '../models/user.interface';
import { environment } from '../../enviroments/enviroment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  register(userData: User): Observable<User> {
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

  uploadCover(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('cover', file);
    return this.http.post<User>(
      `${this.apiUrl}/usuarios/upload-cover`,
      formData,
      this.getAuthHeaders()
    );
  }

  uploadAvatarForNewUser(userId: string, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<User>(
      `${this.apiUrl}/usuarios/${userId}/avatar`,
      formData,
      this.getAuthHeaders()
    );
  }

  uploadAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<User>(
      `${this.apiUrl}/usuarios/upload-avatar`,
      formData,
      this.getAuthHeaders()
    );
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(
      `${this.apiUrl}/usuarios/${userId}`,
      this.getAuthHeaders()
    );
  }

  addFriend(amigoId: string) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
    return this.http.post(`${this.apiUrl}/usuarios/agregar-amigo`, { amigoId }, { headers });
  }

  getFriends(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(`${this.apiUrl}/usuarios/amigos`, { headers });
  }
}
