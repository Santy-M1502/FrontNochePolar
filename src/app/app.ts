import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Pipes propias
import { CapitalizePipe } from './pipes/capitalize.pipe';
import { HumanNumberPipe } from './pipes/human-number.pipe';
import { RelativeTimePipe } from './pipes/relative-time.pipe';

// Directivas propias
import { HasRoleDirective } from './directives/has-role.directive';
import { DebounceClickDirective } from './directives/debounce-click.directive';
import { LoadingDirective } from './directives/loading.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
    CapitalizePipe,
    HumanNumberPipe,
    RelativeTimePipe,
    HasRoleDirective,
    DebounceClickDirective,
    LoadingDirective
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  showSessionModal = false;

  constructor(private authService: AuthService, private router: Router) {
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
