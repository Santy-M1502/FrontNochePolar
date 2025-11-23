import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { SideNavComponent } from "../side-nav/side-nav";
import { Chat } from "../chat/chat";

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SideNavComponent, Chat],
  templateUrl: './admin-home.html',
  styleUrls: ['./admin-home.css'],
})
export class AdminHomeComponent {
  adminName = '';
  showAddUserModal = false;
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const current = this.authService.getCurrentUser();
    this.adminName = current ? current.username : 'Admin';

    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', Validators.required],
      perfil: ['usuario', Validators.required],
      password: ['', Validators.required],
      passwordRepeat: ['', Validators.required]
    },
    {
      validators: this.passwordsIguales('password', 'passwordRepeat')
    });
  }

  passwordsIguales(pass1: string, pass2: string) {
    return (formGroup: FormGroup) => {
      const pass1Control = formGroup.get(pass1);
      const pass2Control = formGroup.get(pass2);

      if (pass1Control?.value === pass2Control?.value) {
        pass2Control?.setErrors(null);
      } else {
        pass2Control?.setErrors({ noIguales: true });
      }
    };
  }

  openAddUserModal() {
    this.showAddUserModal = true;
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
    this.cdr.detectChanges()
  }

  goToStats() {
    this.router.navigate(['/admin/estadisticas']);
  }

  submitRegister() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    const { nombre, apellido, username, email, password, fechaNacimiento, perfil } = this.registerForm.value;

    // Asegurar formato ISO 8601 para el campo fecha que el backend requiere
    const fechaISO = fechaNacimiento
      ? new Date(fechaNacimiento).toISOString()
      : new Date().toISOString();

    const payload = {
      username,
      password,
      nombre,
      apellido,
      email,
      fecha: fechaISO,
      perfil: perfil || 'usuario'
    };

    this.userService.register(payload).subscribe({
      next: (res) => {
        this.registerForm.reset();
        this.closeAddUserModal();
      },
      error: (err) => {
        console.error('Error registrando usuario (admin):', err);
        this.registerForm.setErrors({ registroError: true });
      }
    });
  }
}
