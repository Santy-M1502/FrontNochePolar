import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CapitalizePipe } from './pipes/capitalize.pipe';
import { HumanNumberPipe } from './pipes/human-number.pipe';
import { RelativeTimePipe } from './pipes/relative-time.pipe';

import { HasRoleDirective } from './directives/has-role.directive';
import { LoadingDirective } from './directives/loading.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  showSessionModal = false;
  showInvalidTokenModal = false;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.sessionWarning$.subscribe(show => {
      // only show session warning modal if user still has a valid token
      if (show && this.authService.isAuthenticated()) {
        this.showSessionModal = true;
      } else {
        this.showSessionModal = false;
      }
    });

    // listen for token invalidation (expired/invalid) and show modal then redirect
    this.authService.tokenInvalid$.subscribe(reason => {
      if (reason) {
        this.showInvalidTokenModal = true;
        // give user a short moment to see the modal, then redirect to login
        setTimeout(() => {
          this.showInvalidTokenModal = false;
          try { this.router.navigate(['/login']); } catch (e) {}
        }, 800);
      }
    });
      // si el usuario queda en null (logout), redirigir al login
      this.authService.currentUser$.subscribe(user => {
        if (!user) {
          try { this.showSessionModal = false; } catch (e) {}
          try { this.router.navigate(['/login']); } catch (e) {}
        }
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
    try { this.showSessionModal = false; } catch (e) {}
    try { this.router.navigate(['/login']); } catch (e) {}
  }
}
