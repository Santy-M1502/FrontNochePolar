import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  avatarUrl = `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>
      <rect fill='none' width='96' height='96'/>
      <circle cx='48' cy='30' r='18' fill='%23b77bff'/>
      <ellipse cx='48' cy='70' rx='26' ry='12' fill='%23341a52'/>
    </svg>`;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
      if (!this.loginForm.valid) return;
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
    next: (res) => {
      console.log('Login correcto, token guardado:', res.access_token);
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.authService.updateCurrentUser(user);
          this.isLoading = false;
          this.router.navigate(['/profile']);
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'No se pudo cargar el perfil.';
        }
      });
    },
    error: () => {
      this.isLoading = false;
      this.errorMessage = 'Credenciales inválidas. Por favor, inténtalo de nuevo.';
    }
  });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToForgot(): void {
    this.router.navigate(['/forgot-password']);
  }
}
