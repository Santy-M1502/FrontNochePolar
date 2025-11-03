import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
          bio: 'Soy Santi y me gusta programar',
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
    if (!this.coverImage) this.coverImage = 'https://res.cloudinary.com/dzwlpr7ay/image/upload/v1762178571/default-avatar_n9xfbe.avif';
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) { alert('Solo imágenes'); return; }

    const url = URL.createObjectURL(file);
    this.createdUrls.push(url);
    this.coverImage = url;

  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Selecciona solo archivos de imagen.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB.');
      return;
    }

    if (this.userService?.uploadAvatar) {
      this.isUploadingImage = true;
      this.userService.uploadAvatar(file).subscribe({
        next: (updatedUser: User) => {
          this.user = updatedUser;
          this.isUploadingImage = false;
        },
        error: (err) => {
          console.error(err);
          this.isUploadingImage = false;
          alert('Error subiendo avatar.');
        }
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
      }
      this.isUploadingImage = false;
    }, 900);
  }

  onPostImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Selecciona solo imágenes para la publicación.');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    if (this.newPostText.trim()) {
      this.posts.unshift({
        author: this.user,
        content: this.newPostText,
        image: imageUrl,
        createdAt: new Date(),
        likes: 0,
        comments: [],
        shares: 0
      });
      this.newPostText = '';
    } else {
      this.posts.unshift({
        author: this.user,
        content: '',
        image: imageUrl,
        createdAt: new Date(),
        likes: 0,
        comments: [],
        shares: 0
      });
    }
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
    } else {
      console.warn('AuthService.logout() no disponible, simulando.');
    }
    this.router.navigate(['/login']);
  }

  onNewPostInput(event: Event): void {
  const ta = event.target as HTMLTextAreaElement;
  let value = ta.value || '';

  // asegurar que no pase el límite
  if (value.length > this.maxPostChars) {
    value = value.slice(0, this.maxPostChars);
    this.newPostText = value; // sincronizar con ngModel
  }

  this.postCharCount = value.length;
}

// controlar pegado para no exceder límite
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
