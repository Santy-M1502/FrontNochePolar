// (FRONTEND) frontend/src/app/components/login/login.ts
// Componente de inicio de sesión con formulario reactivo
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule], // Standalone component imports
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup; // Formulario reactivo para el login
  isLoading = false;    // Estado de carga para mostrar spinner/deshabilitar botón
  errorMessage = '';    // Mensaje de error para mostrar al usuario

  constructor(
    private fb: FormBuilder,     // Para crear formularios reactivos
    private authService: AuthService, // Para hacer login
    private router: Router       // Para navegar entre rutas
  ) {
    // Inicializar formulario con validaciones
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]], // Campo obligatorio
      password: ['', [Validators.required, Validators.minLength(6)]] // Obligatorio y mín. 6 caracteres
    });
  }

  // Método que se ejecuta al enviar el formulario
  onSubmit(): void {
    // Solo proceder si el formulario es válido
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      // Llamar al servicio de autenticación
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          // Login exitoso - navegar al perfil
          this.router.navigate(['/profile']);
          this.isLoading = false;
        },
        error: (error) => {
          // Login fallido - mostrar error
          this.errorMessage = 'Credenciales inválidas. Por favor, inténtalo de nuevo.';
          this.isLoading = false;
        }
      });
    }
  }

  // Navegar a la página de registro
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}

// (20) FILES_ORDER: 20) frontend/src/app/components/login/login.ts