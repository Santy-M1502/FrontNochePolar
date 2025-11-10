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
  fileError = '';

  avatarPreview: string = `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>
      <rect fill='none' width='96' height='96'/>
      <circle cx='48' cy='30' r='18' fill='%23b77bff'/>
      <ellipse cx='48' cy='70' rx='26' ry='12' fill='%23341a52'/>
    </svg>`;

  descripcionCount = 0;
  private MAX_DESCRIPCION = 200;
  private MAX_AVATAR_BYTES = 5 * 1024 * 1024;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellido: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, Validators.pattern('^\\d{4}-\\d{2}-\\d{2}$')]],
      descripcion: ['', [Validators.maxLength(this.MAX_DESCRIPCION)]],
    }, { validators: this.passwordMatchValidator });

    this.descripcionCount = (this.registerForm.get('descripcion')?.value || '').length;
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
    this.fileError = '';
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.fileError = 'Solo se permiten archivos de imagen (JPG, PNG, GIF).';
      this.selectedFile = null;
      return;
    }

    if (file.size > this.MAX_AVATAR_BYTES) {
      this.fileError = 'La imagen es demasiado grande. Máximo 5MB.';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  onDescripcionInput(event: Event) {
    const ta = event.target as HTMLTextAreaElement;
    let value = ta.value || '';
    if (value.length > this.MAX_DESCRIPCION) {
      value = value.slice(0, this.MAX_DESCRIPCION);
      this.registerForm.get('descripcion')?.setValue(value, { emitEvent: false });
    }
    this.descripcionCount = value.length;
  }

  onSubmit(): void {
  this.registerForm.markAllAsTouched();
  this.errorMessage = '';
  this.successMessage = '';

  if (this.registerForm.invalid) {
    this.errorMessage = 'Corrige los errores del formulario.';
    return;
  }

  this.isLoading = true;
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

  if (this.selectedFile) {
    this.userService.registerWithAvatar(payload, this.selectedFile).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Registrado correctamente. Redirigiendo...';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        if (err?.status === 415 || err?.status === 400) {
          this.tryRegisterThenUpload(payload);
          return;
        }
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Error al registrar usuario.';
      }
    });
    return;
  }

  this.userService.register(payload).subscribe({
    next: (createdUser) => {
      this.isLoading = false;
      this.successMessage = 'Usuario registrado. Redirigiendo...';
      setTimeout(() => this.router.navigate(['/login']), 1000);
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = err?.error?.message || 'Error al registrar usuario.';
    }
  });
}

private tryRegisterThenUpload(payload: any) {
  this.userService.register(payload).subscribe({
    next: (createdUser: any) => {
      const userId = createdUser?._id || createdUser?.id || createdUser?.user?._id;
      if (this.selectedFile && userId) {
        this.userService.uploadAvatarForNewUser(userId, this.selectedFile).subscribe({
          next: () => {
            this.isLoading = false;
            this.successMessage = 'Registrado y avatar subido correctamente.';
            setTimeout(() => this.router.navigate(['/login']), 900);
          },
          error: (err) => {
            console.error(err);
            this.isLoading = false;
            this.errorMessage = 'Usuario registrado, pero error al subir avatar.';
            setTimeout(() => this.router.navigate(['/login']), 1200);
          }
        });
      } else {
        this.isLoading = false;
        this.successMessage = 'Usuario registrado correctamente.';
        setTimeout(() => this.router.navigate(['/login']), 900);
      }
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = err?.error?.message || 'Error al registrar usuario.';
    }
  });
}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
