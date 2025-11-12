import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComentariosService } from '../../services/comentarios.service';
import { Comentario } from '../../models/comentario.interface';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coments.html',
  styleUrls: ['./coments.css']
})
export class ComentariosComponent {
  @Input() publicacionId!: string;
  @Input() usuarioActualId!: string | null;

  comentarios = signal<Comentario[]>([]);
  total = signal(0);
  limit = signal(5);
  offset = signal(0);
  orden = signal<'recientes' | 'antiguos' | 'populares'>('recientes');

  nuevoComentario = signal('');
  errorComentario = signal('');
  modalVisible = signal(false);
  loading = signal(false);

  likedCache = signal(new Map<string, boolean>());

  readonly MAX_LENGTH = 100;

  constructor(private comentariosService: ComentariosService) {}

  private persistCache() {
    try {
      const obj: Record<string, boolean> = {};
      this.likedCache().forEach((v, k) => (obj[k] = v));
      localStorage.setItem(`likedComments_${this.publicacionId}`, JSON.stringify(obj));
    } catch {}
  }

  private loadCacheFromStorage() {
    try {
      const raw = localStorage.getItem(`likedComments_${this.publicacionId}`);
      if (!raw) return;
      const obj = JSON.parse(raw) as Record<string, boolean>;
      const m = new Map<string, boolean>();
      Object.keys(obj).forEach(k => m.set(k, obj[k]));
      this.likedCache.set(m);
    } catch {}
  }

  private marcarLikes(comentarios: Comentario[]): Comentario[] {
    if (this.likedCache().size === 0) this.loadCacheFromStorage();

    return comentarios.map(c => {
      const likesArray = (c as any).likes && Array.isArray((c as any).likes)
        ? (c as any).likes as string[]
        : null;

      const likedFromArray = likesArray && this.usuarioActualId
        ? likesArray.includes(this.usuarioActualId)
        : null;

      const likedFromCache = this.likedCache().get(c._id);

      const finalLiked = likedFromArray ?? likedFromCache ?? !!c.liked;

      const computedLikesCount = likesArray ? likesArray.length : (c.likesCount || 0);

      return {
        ...c,
        liked: finalLiked,
        likesCount: computedLikesCount
      };
    });
  }

  abrirModal() {
    this.modalVisible.set(true);
    this.offset.set(0);
    this.loadCacheFromStorage();
    this.cargarComentarios(false);
  }

  cerrarModal() {
    this.modalVisible.set(false);
  }

  cargarComentarios(acumular = false) {
    if (!this.publicacionId) return;

    this.loading.set(true);
    this.comentariosService
      .obtenerPorPublicacion(this.publicacionId, this.limit(), this.offset(), this.orden())
      .subscribe({
        next: res => {
          const comentariosConLike = this.marcarLikes(res.comentarios);
          if (acumular) {
            this.comentarios.update(prev => [...prev, ...comentariosConLike]);
          } else {
            this.comentarios.set(comentariosConLike);
          }
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: err => {
          console.error(err);
          this.loading.set(false);
        }
      });
  }

  agregarComentario() {
    const texto = this.nuevoComentario().trim();
    this.errorComentario.set('');

    if (!texto) {
      this.errorComentario.set('El comentario no puede estar vacío.');
      return;
    }

    if (texto.length > this.MAX_LENGTH) {
      this.errorComentario.set(`El comentario no puede superar los ${this.MAX_LENGTH} caracteres.`);
      return;
    }

    if (!this.publicacionId) return;

    this.comentariosService.comentarPublicacion(this.publicacionId, texto)
      .subscribe({
        next: nuevo => {
          const c = { ...nuevo, liked: false };
          this.comentarios.update(prev => [c, ...prev]);
          this.nuevoComentario.set('');
          this.errorComentario.set('');
        },
        error: err => console.error(err)
      });
  }

  darLike(comentario: Comentario) {
    if (!comentario._id || comentario.liked) return;

    comentario.liked = true;
    comentario.likesCount = (comentario.likesCount || 0) + 1;

    this.comentariosService.darLike(comentario._id).subscribe({
      next: () => {
        const m = new Map(this.likedCache());
        m.set(comentario._id, true);
        this.likedCache.set(m);
        this.persistCache();
      },
      error: err => {
        console.error(err);
        comentario.liked = false;
        comentario.likesCount = Math.max((comentario.likesCount || 1) - 1, 0);
      }
    });
  }

  quitarLike(comentario: Comentario) {
    if (!comentario._id || !comentario.liked) return;

    comentario.liked = false;
    comentario.likesCount = Math.max((comentario.likesCount || 1) - 1, 0);

    this.comentariosService.quitarLike(comentario._id).subscribe({
      next: () => {
        const m = new Map(this.likedCache());
        m.set(comentario._id, false);
        this.likedCache.set(m);
        this.persistCache();
      },
      error: err => {
        console.error(err);
        comentario.liked = true;
        comentario.likesCount = (comentario.likesCount || 0) + 1;
      }
    });
  }

  cargarMas() {
    this.offset.update(v => v + this.limit());
    this.cargarComentarios(true);
  }
}
