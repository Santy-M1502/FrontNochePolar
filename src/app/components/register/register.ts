import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedFile: File | null = null;
  avatarPreview: string = `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>
      <rect fill='none' width='96' height='96'/>
      <circle cx='48' cy='30' r='18' fill='%23b77bff'/>
      <ellipse cx='48' cy='70' rx='26' ry='12' fill='%23341a52'/>
    </svg>`;

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

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
  }

  controlInvalid(name: string) {
    const c = this.registerForm.get(name);
    return c ? c.invalid && c.touched : false;
  }
  controlTouched(name: string) {
    const c = this.registerForm.get(name);
    return c ? c.touched : false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      this.avatarPreview = `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>
      <rect fill='none' width='96' height='96'/>
      <circle cx='48' cy='30' r='18' fill='%23b77bff'/>
      <ellipse cx='48' cy='70' rx='26' ry='12' fill='%23341a52'/>
    </svg>`;
      return;
    }
    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview = reader.result as string;
    reader.readAsDataURL(this.selectedFile);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const form = this.registerForm.value;
    const payload = {
      username: form.username,
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      password: form.password,
      fecha: form.fechaNacimiento,
      descripcion: form.descripcion,
    };

    this.userService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Usuario registrado exitosamente. Redirigiendo al login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Error al registrar usuario.';
        if (err?.error?.details) this.errorMessage = (err.error.details).join(' ');
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
