import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  constructor(private authService: AuthService, private router: Router){}

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
}