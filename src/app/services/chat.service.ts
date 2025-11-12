import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ChatHttpService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getConversation(partnerId: string) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
    return this.http.get(`${this.apiUrl}/chat/conversation/${partnerId}`, { headers });
  }

  sendMessage(to: string, text: string) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
    return this.http.post(`${this.apiUrl}/chat/send`, { to, text }, { headers });
  }
}
