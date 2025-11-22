import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    const user = this.authService.loadUserProfileFromStorage();
    if (!user) {
      this.authService.loadUserProfile(); 
      return false;
    }

    if (user.perfil === 'admin') {
      this.router.navigate(['/admin/inicio'])
      return true;
    } else {
      this.router.navigate(['/publicaciones']); 
      return false;
    }
  }
}
