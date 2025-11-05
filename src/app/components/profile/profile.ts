import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.interface';
import { SideNavComponent } from "../side-nav/side-nav";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isLoading = true;
  isUploadingImage = false;
  newPostText = '';
  posts: any[] = [];
  maxPostChars = 200;
  postCharCount = 0;
  likedPosts: any[] = [];
  savedPosts: any[] = [];
  activeSection: 'publicaciones' | 'me-gusta' | 'guardados' = 'publicaciones';

  coverImage = 'https://res.cloudinary.com/dzwlpr7ay/image/upload/v1762178571/default-avatar_n9xfbe.avif';
  avatarAnon = 'https://res.cloudinary.com/dzwlpr7ay/image/upload/v1762178755/avatar-anon_vmiwkv.png';
  private createdUrls: string[] = [];

  // NUEVO: mensajes para mostrar al usuario
  userMessage: string = '';
  messageType: 'error' | 'info' = 'info';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService?.currentUser$) {
      this.authService.currentUser$.subscribe({
        next: (u) => {
          this.user = u ?? null;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.router.navigate(['/login']);
        }
      });
    } else {
      setTimeout(() => {
        this.user = {
          username: 'zerai',
          descripcion: 'Soy Santi y me gusta programar',
          followers: 42,
          following: 10,
          profileImage: ''
        };

        this.posts = [
          { author: this.user, content: 'Primer post!', createdAt: new Date(), likes: 5, comments: [], shares: 1 },
          { author: this.user, content: 'Hola mundo!', createdAt: new Date(), likes: 2, comments: [], shares: 0 },
          { author: this.user, content: 'Ejemplo: Este mensaje sirve para ver cómo se verá una publicación en la sección Publicaciones.', createdAt: new Date(), likes: 12, comments: [{text:'Buen post'}], shares: 2 }
        ];

        this.likedPosts = [ this.posts[2], this.posts[1] ];
        this.savedPosts = [];

        this.isLoading = false;
      }, 400);
    }

    if (!this.coverImage) {
      this.coverImage = 'https://res.cloudinary.com/dzwlpr7ay/image/upload/v1762178571/default-avatar_n9xfbe.avif';
    }
  }

  showMessage(message: string, type: 'error' | 'info' = 'info', duration = 3000) {
    this.userMessage = message;
    this.messageType = type;
    setTimeout(() => this.userMessage = '', duration);
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.showMessage('Solo imágenes', 'error');
      return;
    }

    const url = URL.createObjectURL(file);
    this.createdUrls.push(url);
    this.coverImage = url;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    console.log('📤 Archivo seleccionado:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!file.type.startsWith('image/')) {
      this.showMessage('Selecciona solo archivos de imagen.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.showMessage('La imagen debe ser menor a 5MB.', 'error');
      return;
    }

    if (this.userService?.uploadAvatar) {
      this.isUploadingImage = true;
      console.log('🚀 Enviando imagen al backend...');
      this.userService.uploadAvatar(file).subscribe({
        next: (updatedUser: User) => {
          console.log('✅ Respuesta del servidor:', updatedUser);
          this.user = updatedUser;
          this.isUploadingImage = false;
          this.showMessage('Avatar subido correctamente.', 'info');
        },
        error: (err) => {
          this.isUploadingImage = false;
          console.error('❌ Error subiendo avatar:', err);
          this.showMessage('Error subiendo avatar.', 'error');
        },
      });
    } else {
      this.simulateUpload(file);
    }
  }


  selectSection(section: 'publicaciones' | 'me-gusta' | 'guardados'): void {
    this.activeSection = section;
  }

  private simulateUpload(file: File): void {
    this.isUploadingImage = true;
    setTimeout(() => {
      if (this.user) {
        this.user.profileImage = URL.createObjectURL(file);
        this.showMessage('Avatar subido correctamente.', 'info');
      }
      this.isUploadingImage = false;
    }, 900);
  }

  onPostImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.showMessage('Selecciona solo imágenes para la publicación.', 'error');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    this.posts.unshift({
      author: this.user,
      content: this.newPostText.trim() || '',
      image: imageUrl,
      createdAt: new Date(),
      likes: 0,
      comments: [],
      shares: 0
    });
    this.newPostText = '';
  }

  publish(): void {
    if (!this.newPostText?.trim()) return;
    this.posts.unshift({
      author: this.user,
      content: this.newPostText.trim(),
      createdAt: new Date(),
      likes: 0,
      comments: [],
      shares: 0
    });
    this.newPostText = '';
  }

  editProfile(): void {
    this.router.navigate(['/profile', 'edit']);
  }

  logout(): void {
    if (this.authService?.logout) {
      this.authService.logout();
    }
    this.router.navigate(['/login']);
  }

  onNewPostInput(event: Event): void {
    const ta = event.target as HTMLTextAreaElement;
    let value = ta.value || '';

    if (value.length > this.maxPostChars) {
      value = value.slice(0, this.maxPostChars);
      this.newPostText = value;
    }

    this.postCharCount = value.length;
  }

  onPostPaste(event: ClipboardEvent): void {
    const paste = (event.clipboardData?.getData('text') || '');
    const current = this.newPostText || '';
    const available = this.maxPostChars - current.length;

    if (paste.length > available) {
      event.preventDefault();
      const toInsert = paste.slice(0, available);
      this.newPostText = (current + toInsert).slice(0, this.maxPostChars);
      this.postCharCount = this.newPostText.length;
    }
  }
}
