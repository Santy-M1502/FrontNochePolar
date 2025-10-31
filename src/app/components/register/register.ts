// (FRONTEND) frontend/src/app/components/register/register.ts
// Componente de registro con validación de confirmación de contraseña
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule], // Standalone component imports
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedFile: File | null = null;
  avatarPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      descripcion: [''],
    }, { validators: this.passwordMatchValidator });
  }

  // Validador de coincidencia de contraseñas
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
  }

  // Helpers para template
  controlInvalid(name: string) {
    const c = this.registerForm.get(name);
    return c ? c.invalid && c.touched : false;
  }
  controlTouched(name: string) {
    const c = this.registerForm.get(name);
    return c ? c.touched : false;
  }

  // Manejo del archivo y preview
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      this.avatarPreview = null;
      return;
    }
    this.selectedFile = input.files[0];

    // preview
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview = reader.result as string;
    reader.readAsDataURL(this.selectedFile);
  }

  // Envío del formulario
  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const form = this.registerForm.value;
    // Mapear al payload que espera el backend
    const payload = {
      username: form.username,
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      password: form.password,
      fecha: form.fechaNacimiento, // backend: fecha o fechaNacimiento según tu DTO
      descripcion: form.descripcion,
    };

    // 1) Registrar usuario (JSON). Si querés subir avatar durante registro, necesitás backend que acepte multipart/form-data.
    this.userService.register(payload).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.successMessage = 'Usuario registrado exitosamente. Redirigiendo al login...';
        // Si necesitás subir avatar inmediatamente, implementá endpoint server-side para aceptar multipart con la creación,
        // o logueá al usuario y luego llamá uploadAvatar con auth token.
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Error al registrar usuario.';
        // Si la API devuelve details, podés mostrarlas:
        if (err?.error?.details) {
          this.errorMessage = (err.error.details).join(' ');
        }
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}