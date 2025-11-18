import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = this.authService.getToken();

    if (token) {
      // si hay token cargamos el perfil desde localStorage
      const user = this.authService.loadUserProfileFromStorage();
      if (user) return true; // logueado, deja pasar
      // si no está en localStorage, cargamos desde backend
      this.authService.loadUserProfile(); // opcional: podemos esperar su resultado antes de redirigir
      return true;
    } else {
      // no hay token → redirige a login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
