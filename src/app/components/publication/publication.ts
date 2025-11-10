import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Publicacion } from '../../models/publication.interface';
import { PublicacionesService } from '../../services/publication.service';
import { ComentariosComponent } from '../coments/coments';

@Component({
  selector: 'app-publicacion',
  standalone: true,
  imports: [CommonModule, ComentariosComponent],
  templateUrl: './publication.html',
  styleUrls: ['./publication.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicacionComponent {
  @Input() publicacion!: Publicacion;
  @Input() usuarioActualId!: string | null;

  @Output() eliminar = new EventEmitter<string>();
  @Output() likeToggled = new EventEmitter<{
    id: string;
    liked: boolean;
    likes: number;
  }>();

  menuVisible = false;
  processing = false;
  animatingLike = false;
  animatingUnlike = false;
  comentariosModalVisible = false;
  confirmVisible = false;

  constructor(private publicacionesService: PublicacionesService) {}

  ngOnInit() {
    document.addEventListener('click', this.cerrarMenu.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.cerrarMenu.bind(this));
  }

  likesCount(): number {
    if (Array.isArray(this.publicacion.likes)) return this.publicacion.likes.length;
    if (typeof (this.publicacion as any).likesCount === 'number')
      return (this.publicacion as any).likesCount;
    return 0;
  }

  darLike() {
    if (!this.publicacion._id || this.processing) return;
    this.processing = true;

    this.publicacion.liked = true;
    this.animatingUnlike = false;
    this.animatingLike = true;
    setTimeout(() => (this.animatingLike = false), 600);

    if (!Array.isArray(this.publicacion.likes)) this.publicacion.likes = [];
    if (this.usuarioActualId) this.publicacion.likes.push(this.usuarioActualId);

    this.publicacionesService.darLike(this.publicacion._id).subscribe({
      next: () => {
        this.processing = false;
        this.likeToggled.emit({
          id: this.publicacion._id,
          liked: true,
          likes: this.likesCount(),
        });
      },
      error: (err) => {
        console.error('Error al dar like', err);
        this.publicacion.liked = false;
        if (this.usuarioActualId) {
          this.publicacion.likes = (this.publicacion.likes || []).filter(
            (id: string) => id !== this.usuarioActualId
          );
        }
        this.processing = false;
        this.animatingLike = false;
      },
    });
  }

  quitarLike() {
    if (!this.publicacion._id || this.processing) return;
    this.processing = true;

    this.animatingUnlike = true;
    setTimeout(() => (this.animatingUnlike = false), 400);

    this.publicacion.liked = false;
    if (this.usuarioActualId) {
      this.publicacion.likes = (this.publicacion.likes || []).filter(
        (id: string) => id !== this.usuarioActualId
      );
    }

    this.publicacionesService.quitarLike(this.publicacion._id).subscribe({
      next: () => {
        this.processing = false;
        this.likeToggled.emit({
          id: this.publicacion._id,
          liked: false,
          likes: this.likesCount(),
        });
      },
      error: (err) => {
        console.error('Error al quitar like', err);
        this.publicacion.liked = true;
        this.publicacion.likes = this.publicacion.likes || [];
        if (this.usuarioActualId)
          this.publicacion.likes.push(this.usuarioActualId);
        this.processing = false;
        this.animatingUnlike = false;
      },
    });
  }

  mostrarConfirm(event: MouseEvent) {
    event.stopPropagation();
    this.menuVisible = false;
    this.confirmVisible = true;
  }

  cancelarEliminar() {
    this.confirmVisible = false;
  }

  confirmarEliminar() {
    if (!this.publicacion._id || this.processing) return;

    this.processing = true;
    this.publicacionesService.eliminarPublicacion(this.publicacion._id).subscribe({
      next: () => {
        this.processing = false;
        this.confirmVisible = false;
        this.eliminar.emit(this.publicacion._id);
      },
      error: (err) => {
        console.error('[confirmarEliminar] ❌ Error al eliminar publicación:', err);
        this.processing = false;
        this.confirmVisible = false;
      },
    });
  }

  esMia(): boolean {
    if (!this.publicacion || !this.usuarioActualId) return false;

    const pub = this.publicacion;
    const uid =
      typeof pub.usuarioId === 'string'
        ? pub.usuarioId
        : (pub.usuarioId as any)?._id ??
          (pub.usuario as any)?._id ??
          undefined;

    return uid === this.usuarioActualId;
  }


  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuVisible = !this.menuVisible;
  }

  private cerrarMenu() {
    if (this.menuVisible) this.menuVisible = false;
  }
}
