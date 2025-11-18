import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  constructor(private authService: AuthService){}

  ngOnInit() {
  const token = this.authService.getToken();
  if (token) {
    const user = this.authService.loadUserProfileFromStorage();
    if (user) {
      // usuario cargado, ya se considera logueado
      // opcional: podés validar token con backend aquí si querés
    } else {
      // token existe pero usuario no está en localStorage → limpiar token
      localStorage.removeItem('token');
    }
  }
}
}