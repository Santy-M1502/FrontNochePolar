import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publication.service';
import { InteraccionesService } from '../../services/interacciones.service';
import { Publicacion } from '../../models/publication.interface';
import { PublicacionComponent } from '../publication/publication';
import { Chat } from '../chat/chat';
import { SideNavComponent } from '../side-nav/side-nav';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  imports: [CommonModule, SideNavComponent, Chat, PublicacionComponent],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  usuarioActualId: string | null = null;

  posts: Publicacion[] = [];
  likedPosts: Publicacion[] = [];
  savedPosts: Publicacion[] = [];

  visiblePosts = 3;
  visibleLiked = 3;
  visibleSaved = 3;

  activeSection: 'publicaciones' | 'me-gusta' | 'guardados' = 'publicaciones';
  coverImage: string = 'https://res.cloudinary.com/dzwlpr7ay/image/upload/v1762178571/default-avatar_n9xfbe.avif';
  avatarAnon: string = 'https://res.cloudinary.com/dzwlpr7ay/image/upload/v1762178755/avatar-anon_vmiwkv.png';

  constructor(
    private publicacionesService: PublicacionesService,
    private auth: AuthService,
    private interaccionesService: InteraccionesService
  ) {}

  ngOnInit() {
    this.usuarioActualId = this.auth.getUserId();
    this.loadUserData();
    this.loadUserPosts();
  }

  loadUserData() {
    this.auth.getUserInfo().subscribe({
      next: (info) => {
        if (info) {
          this.user = info;
        } else if (this.usuarioActualId) {
          this.auth.getUsuarioPorId(this.usuarioActualId).subscribe({
            next: (data) => (this.user = data),
            error: (err) => console.error('Error al obtener usuario:', err),
          });
        }
      },
      error: (err) => console.error('Error al obtener info del usuario:', err)
    });
  }

  private marcarLikes(posts: Publicacion[]): Publicacion[] {
    return posts.map((p) => ({
      ...p,
      liked: this.usuarioActualId ? p.likes?.includes(this.usuarioActualId) : false,
    }));
  }

  loadUserPosts() {
    if (!this.usuarioActualId) return;
    this.publicacionesService.obtenerPorUsuario(this.usuarioActualId).subscribe({
      next: (posts) => (this.posts = this.marcarLikes(posts)),
      error: (err) => console.error('Error al obtener publicaciones:', err),
    });
  }

  loadLikedPosts() {
    if (!this.usuarioActualId) return;
    this.interaccionesService.obtenerLikesDeUsuario(this.usuarioActualId).subscribe({
      next: (res) => (this.likedPosts = this.marcarLikes(res)),
      error: (err) => console.error('Error al obtener me gusta:', err),
    });
  }

  loadSavedPosts() {
    if (!this.usuarioActualId) return;
    this.interaccionesService.obtenerGuardadas(this.usuarioActualId).subscribe({
      next: (res) => (this.savedPosts = this.marcarLikes(res)),
      error: (err) => console.error('Error al obtener guardados:', err),
    });
  }

  selectSection(section: 'publicaciones' | 'me-gusta' | 'guardados') {
    this.activeSection = section;
    if (section === 'me-gusta') this.loadLikedPosts();
    if (section === 'guardados') this.loadSavedPosts();
  }

  onPublicacionEliminada(id: string) {
    this.posts = this.posts.filter((p) => p._id !== id);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) console.log('Imagen de perfil seleccionada:', file.name);
  }

  onCoverSelected(event: any) {
    const file = event.target.files[0];
    if (file) console.log('Portada seleccionada:', file.name);
  }

  editarPerfil() {
    console.log('Abrir modal para editar perfil');
  }

  logout() {
    this.auth.logout();
  }

  mostrarMas(section: 'publicaciones' | 'me-gusta' | 'guardados') {
    const incremento = 3;
    switch (section) {
      case 'publicaciones':
        this.visiblePosts += incremento;
        break;
      case 'me-gusta':
        this.visibleLiked += incremento;
        break;
      case 'guardados':
        this.visibleSaved += incremento;
        break;
    }
  }
}
