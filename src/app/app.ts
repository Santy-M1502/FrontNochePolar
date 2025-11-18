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
    if (!user) {
      // token existe pero usuario no estaba en localStorage → cargamos desde backend
      this.authService.loadUserProfile();
    }
  }
}
}