import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publication.service';
import { InteraccionesService } from '../../services/interacciones.service';
import { Publicacion } from '../../models/publication.interface';
import { PublicacionComponent } from '../publication/publication';
import { Chat } from '../chat/chat';
import { SideNavComponent } from '../side-nav/side-nav';
import { UserService } from '../../services/user.service';
import { HumanNumberPipe } from '../../pipes/human-number.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  imports: [CommonModule, SideNavComponent, Chat, PublicacionComponent, HumanNumberPipe],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  usuarioActualId: string | null = null;

  likedCount = 0;
  savedCount = 0;

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
    private interaccionesService: InteraccionesService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe((u) => {
      this.user = u;
      this.usuarioActualId = u?._id || null;

      if (this.usuarioActualId) {
        this.loadUserPosts();
        this.loadLikedCount();
        this.loadSavedCount();
      } else {
        this.posts = [];
        this.likedPosts = [];
        this.savedPosts = [];
        this.likedCount = 0;
        this.savedCount = 0;
      }
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
    this.loadLikedCount();
    this.loadSavedCount();
  }

  onImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.userService.uploadAvatar(file).subscribe({
      next: (res) => {
        console.log('✅ Avatar actualizado:', res);
        this.auth.setUser(res as any);
      },
      error: (err) => console.error('❌ Error al subir avatar:', err)
    });
  }

  onCoverSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.userService.uploadCover(file).subscribe({
      next: (res) => {
        console.log('✅ Portada actualizada:', res);
        this.auth.setUser(res);
      },
      error: (err) => console.error('❌ Error al subir portada:', err)
    });
  }

  refreshCounts() {
    this.loadLikedCount();
    this.loadSavedCount();
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

  loadLikedCount() {
    if (!this.usuarioActualId) return;
    this.interaccionesService.obtenerLikesDeUsuario(this.usuarioActualId).subscribe({
      next: (res) => this.likedCount = res.length,
      error: (err) => console.error('Error al contar me gusta:', err),
    });
  }

  loadSavedCount() {
    if (!this.usuarioActualId) return;
    this.interaccionesService.obtenerGuardadas(this.usuarioActualId).subscribe({
      next: (res) => this.savedCount = res.length,
      error: (err) => console.error('Error al contar guardados:', err),
    });
  }

  onLikeChange(payload: { postId: string; liked: boolean; likesCount: number }) {
    if (!payload) {
      this.loadLikedCount();
      this.loadSavedCount();
      return;
    }

    const { postId, liked, likesCount } = payload;

    this.posts = this.posts.map(p =>
      p._id === postId ? { ...p, liked, likesCount, likes: this.syncLikesArray(p.likes, this.usuarioActualId, liked) } : p
    );

    this.likedPosts = this.likedPosts.map(p =>
      p._id === postId ? { ...p, liked, likesCount } : p
    );

    this.savedPosts = this.savedPosts.map(p =>
      p._id === postId ? { ...p, liked, likesCount } : p
    );

    this.loadLikedCount();
    this.loadSavedCount();
  }

  private syncLikesArray(currentLikes: string[] | undefined, userId: string | null, liked: boolean): string[] {
    const likes = Array.isArray(currentLikes) ? [...currentLikes] : [];
    if (!userId) return likes;
    const idx = likes.indexOf(userId);
    if (liked && idx === -1) likes.push(userId);
    if (!liked && idx !== -1) likes.splice(idx, 1);
    return likes;
  }
}
