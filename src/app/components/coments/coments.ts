import { Component, Input, signal, effect } from '@angular/core';
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
  modalVisible = signal(false);
  loading = signal(false);

  constructor(private comentariosService: ComentariosService) {}

  private marcarLikes(comentarios: Comentario[]): Comentario[] {
    return comentarios.map(c => ({
      ...c,
      liked: !!c.liked,
      likesCount: c.likesCount || 0
    }));
  }

  abrirModal() {
    this.modalVisible.set(true);
    this.offset.set(0);
    this.cargarComentarios(false);
  }

  cerrarModal() {
    this.modalVisible.set(false);
  }

  cargarComentarios(acumular = false) {
    if (!this.publicacionId) return;

    this.loading.set(true);
    this.comentariosService.obtenerPorPublicacion(this.publicacionId, this.limit(), this.offset(), this.orden())
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
    if (!texto || !this.publicacionId) return;

    this.comentariosService.comentarPublicacion(this.publicacionId, texto)
      .subscribe({
        next: nuevo => {
          // Inicializamos liked en false
          const c = { ...nuevo, liked: false };
          this.comentarios.update(prev => [c, ...prev]);
          this.nuevoComentario.set('');
        },
        error: err => console.error(err)
      });
  }

  darLike(comentario: Comentario) {
    if (!comentario._id || comentario.liked) return;

    comentario.liked = true;
    comentario.likesCount = (comentario.likesCount || 0) + 1;

    this.comentariosService.darLike(comentario._id).subscribe({
      next: () => {},
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
      next: () => {},
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
