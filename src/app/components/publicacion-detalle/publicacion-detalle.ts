import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicacionesService } from '../../services/publication.service';
import { SideNavComponent } from "../side-nav/side-nav";
import { PublicacionComponent } from "../publication/publication";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chat } from "../chat/chat";
import { ScrollToTopComponent } from '../scroll-to-top/scroll-to-top';
import { Comentario } from '../../models/comentario.interface';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ComentariosService } from '../../services/comentarios.service';
import { HumanNumberPipe } from '../../pipes/human-number.pipe';

@Component({
  selector: 'app-publicacion-detalle',
  templateUrl: './publicacion-detalle.html',
  styleUrls: ['./publicacion-detalle.css'],
  imports: [SideNavComponent, PublicacionComponent, FormsModule, CommonModule, Chat, ScrollToTopComponent, HumanNumberPipe],
})
export class PublicacionDetalleComponent implements OnInit {
  publicacion: any;
  cargando = true;
  error: string | null = null;

  comentarios: Comentario[] = [];
  totalComentarios = 0;
  limit = 3;
  offset = 0;
  orden: 'recientes' | 'antiguos' | 'populares' = 'recientes';
  cargandoComentarios = false;
  cargandoMas = false;
  hasMore = false;
  nuevoComentario = '';

  editarComentarioSeleccionado: Comentario | null = null;
  comentarioEditadoTexto = '';
  maxCaracteres = 20;

  constructor(
    private route: ActivatedRoute,
    private publicacionesSrv: PublicacionesService,
    public authService: AuthService,
    private comentariosSrv: ComentariosService
  ) {}

  private comentariosSub: Subscription | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargarPublicacion(id);
  }

  ngOnDestroy(): void {
    if (this.comentariosSub) this.comentariosSub.unsubscribe();
  }

  cargarPublicacion(id: string) {
    this.cargando = true;
    this.publicacionesSrv.obtenerPublicacionPorId(id).subscribe({
      next: (pub) => {
        this.publicacion = pub;
        this.cargando = false;
        // cargar comentarios paginados desde el servicio
        this.comentariosSrv.limpiarComentarios();
        this.offset = 0;
        this.comentarios = [];
        this.loadComentarios();
      },
      error: () => {
        this.error = 'No se encontró la publicación.';
        this.cargando = false;
      },
    });
  }

  private loadComentarios() {
    if (!this.publicacion || !this.publicacion._id) return;
    this.cargandoComentarios = true;
    const token = this.authService.getToken() || '';
    this.comentariosSrv.obtenerPorPublicacion(this.publicacion._id, this.limit, this.offset, this.orden, token)
      .subscribe({
        next: (coms) => {
          if (this.offset === 0) this.comentarios = coms;
          else this.comentarios = [...this.comentarios, ...coms];
          // si la cantidad recibida es igual al limit, puede haber más
          this.hasMore = coms.length === this.limit;
          this.cargandoComentarios = false;
          this.cargandoMas = false;
        },
        error: (err) => {
          console.error('[loadComentarios] Error', err);
          this.cargandoComentarios = false;
          this.cargandoMas = false;
        }
      });

    // subscribe to service comentarios$ to receive real-time updates (e.g., new comments)
    if (!this.comentariosSub) {
      this.comentariosSub = this.comentariosSrv.comentarios$.subscribe(list => {
        // keep the local list in sync with the service
        this.comentarios = list;
      });
    }
  }

  cargarMas() {
    if (!this.hasMore || this.cargandoComentarios) return;
    this.cargandoMas = true;
    this.offset += this.limit;
    this.loadComentarios();
  }

  esMioComentario(comentario: Comentario): boolean {
    const uid = this.authService.getCurrentUser()?._id;
    return !!comentario && !!uid && comentario.usuario?._id === uid;
  }

  darLike(comentario: Comentario) {
    const uid = this.authService.getCurrentUser()?._id;
    const token = this.authService.getToken();
    if (!comentario || !uid || !token) return;

    comentario.liked = true;
    comentario.likesCount = (comentario.likesCount || 0) + 1;
    comentario.likes = comentario.likes || [];
    comentario.likes.push(uid);

    this.comentariosSrv.darLike(comentario._id, token).subscribe({
      next: () => {},
      error: () => {
        comentario.liked = false;
        comentario.likesCount = Math.max((comentario.likesCount || 1) - 1, 0);
        comentario.likes = comentario.likes?.filter(id => id !== uid);
      }
    });
  }

  quitarLike(comentario: Comentario) {
    const uid = this.authService.getCurrentUser()?._id;
    const token = this.authService.getToken();
    if (!comentario || !uid || !token) return;

    comentario.liked = false;
    comentario.likesCount = Math.max((comentario.likesCount || 1) - 1, 0);
    comentario.likes = comentario.likes?.filter(id => id !== uid);

    this.comentariosSrv.quitarLike(comentario._id, token).subscribe({
      next: () => {},
      error: () => {
        comentario.liked = true;
        comentario.likesCount = (comentario.likesCount || 0) + 1;
        comentario.likes = comentario.likes || [];
        comentario.likes.push(uid);
      }
    });
  }

  comentar() {
    if (!this.nuevoComentario.trim()) return;
    const texto = this.nuevoComentario.trim();
    const token = this.authService.getToken();
    if (!token) return;

    this.nuevoComentario = '';
    this.comentariosSrv.comentarPublicacion(this.publicacion._id, texto, token).subscribe({
      next: (nuevo) => {
        // the ComentariosService ya empuja el nuevo comentario al BehaviorSubject,
        // nuestra suscripción a comentarios$ actualizará `this.comentarios`.
        this.totalComentarios = (this.totalComentarios || 0) + 1;
      },
      error: (err) => {
        console.error('[comentar] Error', err);
      }
    });
  }

  abrirModalEditar(comentario: Comentario) {
    if (!this.esMioComentario(comentario)) return;
    this.editarComentarioSeleccionado = comentario;
    this.comentarioEditadoTexto = comentario.texto;
  }

  guardarEdicion() {
    if (!this.editarComentarioSeleccionado) return;
    const textoTrim = this.comentarioEditadoTexto.trim();
    const truncated = textoTrim.length > this.maxCaracteres ? textoTrim.slice(0, this.maxCaracteres) : textoTrim;
    this.editarComentarioSeleccionado.texto = truncated;
    this.editarComentarioSeleccionado.editado = true;
    this.editarComentarioSeleccionado = null;
    this.comentarioEditadoTexto = '';
  }

  get palabrasComentarioEditado(): number {
    if (!this.comentarioEditadoTexto) return 0;
    return this.comentarioEditadoTexto.length;
  }

  cancelarEdicion() {
    this.editarComentarioSeleccionado = null;
    this.comentarioEditadoTexto = '';
  }
}
