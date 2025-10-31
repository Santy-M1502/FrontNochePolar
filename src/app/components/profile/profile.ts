// (10) (cloudinary) Componente de perfil con funcionalidad de subida de imagen
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isLoading = true;
  isUploadingImage = false; // Estado para mostrar loader durante subida

  constructor(
    private authService: AuthService,
    private userService: UserService, // Inyectar UserService para subir imagen
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      }
    });
  }

  // Manejar selección de archivo de imagen
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona solo archivos de imagen');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }

      this.uploadImage(file);
    }
  }

  // Subir imagen al servidor
  private uploadImage(file: File): void {
    this.isUploadingImage = true;

    this.userService.uploadAvatar(file).subscribe({
      next: (updatedUser) => {
        this.authService.updateCurrentUser(updatedUser);
        this.user = updatedUser;
        this.isUploadingImage = false;
        console.log('Imagen subida exitosamente:', updatedUser);

        this.authService.getProfile().subscribe({
          next: (freshUserData) => {
            this.authService.updateCurrentUser(freshUserData);
            this.user = freshUserData;
          },
          error: (error) => console.warn('Error al recargar perfil:', error)
        });
      },
      error: (error) => {
        console.error('Error completo al subir imagen:', error);
        let errorMessage = 'Error al subir la imagen. Inténtalo de nuevo.';

        if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        } else if (error.status === 413) {
          errorMessage = 'La imagen es demasiado grande. Máximo 5MB.';
        } else if (error.status === 400) {
          errorMessage = 'Formato de imagen no válido. Solo JPG, PNG, GIF.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        alert(errorMessage);
        this.isUploadingImage = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}