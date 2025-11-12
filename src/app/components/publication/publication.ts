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
import { UserService } from '../../services/user.service';

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

  errorMsg: string | null = null;
  successMsg: string | null = null;

  constructor(
    private publicacionesService: PublicacionesService,
    private userService: UserService
  ) {}

  ngOnInit() {
    document.addEventListener('click', this.cerrarMenu.bind(this));

    if (this.publicacion && Array.isArray(this.publicacion.likes) && this.usuarioActualId) {
      this.publicacion.liked = this.publicacion.likes.includes(this.usuarioActualId);
    }
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.cerrarMenu.bind(this));
  }

  private setError(msg: string) {
    this.errorMsg = msg;
    this.successMsg = null;
    setTimeout(() => (this.errorMsg = null), 4000);
  }

  private setSuccess(msg: string) {
    this.successMsg = msg;
    this.errorMsg = null;
    setTimeout(() => (this.successMsg = null), 4000);
  }

  likesCount(): number {
    if (Array.isArray(this.publicacion.likes)) return this.publicacion.likes.length;
    if (typeof (this.publicacion as any).likesCount === 'number')
      return (this.publicacion as any).likesCount;
    return 0;
  }

  darLike() {
    if (!this.publicacion._id) {
      this.setError('❗ No se puede dar like: falta el ID de la publicación.');
      return;
    }
    if (!this.usuarioActualId) {
      this.setError('⚠️ Debes iniciar sesión para dar like.');
      return;
    }
    if (this.processing) return;

    this.processing = true;
    this.publicacion.liked = true;
    this.animatingUnlike = false;
    this.animatingLike = true;
    setTimeout(() => (this.animatingLike = false), 600);

    if (!Array.isArray(this.publicacion.likes)) this.publicacion.likes = [];
    this.publicacion.likes.push(this.usuarioActualId);

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
        this.setError('❌ Error al dar like. Intenta de nuevo más tarde.');
        this.publicacion.liked = false;
        this.publicacion.likes = this.publicacion.likes?.filter(
          (id: string) => id !== this.usuarioActualId
        );
        this.processing = false;
        this.animatingLike = false;
      },
    });
  }

  quitarLike() {
    if (!this.publicacion._id) {
      this.setError('❗ No se puede quitar el like: falta el ID de la publicación.');
      return;
    }
    if (!this.usuarioActualId) {
      this.setError('⚠️ Debes iniciar sesión para quitar el like.');
      return;
    }
    if (this.processing) return;

    this.processing = true;
    this.animatingUnlike = true;
    setTimeout(() => (this.animatingUnlike = false), 400);

    this.publicacion.liked = false;
    this.publicacion.likes = this.publicacion.likes?.filter(
      (id: string) => id !== this.usuarioActualId
    );

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
        this.setError('❌ Error al quitar like. Intenta más tarde.');
        this.publicacion.liked = true;
        if (this.usuarioActualId)
          this.publicacion.likes?.push(this.usuarioActualId);
        this.processing = false;
        this.animatingUnlike = false;
      },
    });
  }

  agregarAmigo() {
    const uidPub = this.publicacion.usuario?._id || this.publicacion.usuarioId;
    if (!uidPub) {
      this.setError('❗ No se puede agregar: usuario no válido.');
      return;
    }
    if (uidPub === this.usuarioActualId) {
      this.setError('⚠️ No puedes agregarte a ti mismo.');
      return;
    }

    this.userService.addFriend(uidPub).subscribe({
      next: () => {
        this.setSuccess('🤝 Amigo agregado correctamente.');
        this.menuVisible = false;
      },
      error: (err) => {
        console.error('Error al agregar amigo', err);
        this.setError('❌ Error al agregar amigo. Intenta de nuevo.');
      },
    });
  }

  confirmarEliminar() {
    if (!this.publicacion._id) {
      this.setError('❗ No se puede eliminar: falta el ID de la publicación.');
      return;
    }

    this.processing = true;
    this.publicacionesService.eliminarPublicacion(this.publicacion._id).subscribe({
      next: () => {
        this.processing = false;
        this.setSuccess('🗑 Publicación eliminada correctamente.');
        this.confirmVisible = false;
        this.eliminar.emit(this.publicacion._id);
      },
      error: (err) => {
        console.error('[confirmarEliminar] Error:', err);
        this.setError('❌ Error al eliminar la publicación.');
        this.processing = false;
        this.confirmVisible = false;
      },
    });
  }

  cancelarEliminar() {
    this.confirmVisible = false;
  }

  mostrarConfirm(event: MouseEvent) {
    event.stopPropagation();
    this.menuVisible = false;
    this.confirmVisible = true;
  }

  esMia(): boolean {
    if (!this.publicacion || !this.usuarioActualId) return false;
    const uid =
      typeof this.publicacion.usuarioId === 'string'
        ? this.publicacion.usuarioId
        : (this.publicacion.usuarioId as any)?._id ??
          (this.publicacion.usuario as any)?._id;
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
