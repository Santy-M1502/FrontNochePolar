import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  showSessionModal = false;

  constructor(private authService: AuthService, private router: Router){
    this.authService.sessionWarning$.subscribe(show => {
      this.showSessionModal = show;
    });
  }

  ngOnInit() {
    const token = this.authService.getToken();

    setTimeout(() => {
      if (token) {
        const user = this.authService.loadUserProfileFromStorage();
        if (user) {
          this.router.navigate(['/publicaciones']);
        } else {
          this.authService.loadUserProfile();
          this.router.navigate(['/publicaciones']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    }, 500);
  }

  onExtend() {
    this.authService.extendSession();
  }

  onLogout() {
    this.authService.endSession();
  }
  
}