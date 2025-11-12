import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;

  connect(token: string) {
    this.socket = io(environment.API_URL, {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado al WS');
    });
  }

  sendMessage(to: string, text: string) {
    this.socket.emit('send_message', { to, text });
    }

  onMessage(callback: (message: any) => void) {
    this.socket.on('receive_message', callback);
  }
}
