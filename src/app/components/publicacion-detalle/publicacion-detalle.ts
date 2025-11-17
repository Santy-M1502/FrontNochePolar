import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicacionesService } from '../../services/publication.service';
import { SideNavComponent } from "../side-nav/side-nav";
import { PublicacionComponent } from "../publication/publication";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chat } from "../chat/chat";
import { Comentario } from '../../models/comentario.interface';

@Component({
  selector: 'app-publicacion-detalle',
  templateUrl: './publicacion-detalle.html',
  styleUrls: ['./publicacion-detalle.css'],
  imports: [SideNavComponent, PublicacionComponent, FormsModule, CommonModule, Chat],
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
  nuevoComentario = '';

  constructor(
    private route: ActivatedRoute,
    private publicacionesSrv: PublicacionesService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPublicacion(id);
    }
  }

  cargarPublicacion(id: string) {
    this.cargando = true;
    this.publicacionesSrv.obtenerPublicacionPorId(id).subscribe({
      next: (pub) => {
        this.publicacion = pub;
        this.cargando = false;

        this.comentarios = (pub.comentarios || []).map((c: Comentario) => ({
          ...c,
          liked: false,
          likesCount: c.likesCount || 0,
          usuario: {
            ...c.usuario,
            profileImage: c.usuario.profileImage || 'https://i.pravatar.cc/48?img=65'
          }
        })) || [];
        this.totalComentarios = this.comentarios.length;
      },
      error: () => {
        this.error = 'No se encontró la publicación.';
        this.cargando = false;
      },
    });
  }

  cargarMas() {
    if (this.comentarios.length >= this.totalComentarios) return;
    this.cargandoMas = true;
    this.offset += this.limit;

    // Simular carga de más comentarios si ya vienen todos desde el back
    setTimeout(() => {
      this.cargandoMas = false;
    }, 500);
  }

  darLike(comentario: Comentario) {
    if (!comentario) return;

    comentario.liked = true;
    comentario.likesCount = (comentario.likesCount || 0) + 1;

    // Aquí podrías llamar al servicio si tu back soporta likes en comentarios
    // this.comentariosSrv.darLike(comentario._id).subscribe({ ... })
  }

  quitarLike(comentario: Comentario) {
    if (!comentario) return;

    comentario.liked = false;
    comentario.likesCount = (comentario.likesCount || 1) - 1;

    // Aquí podrías llamar al servicio si tu back soporta quitar like
    // this.comentariosSrv.quitarLike(comentario._id).subscribe({ ... })
  }

  comentar() {
    if (!this.nuevoComentario.trim()) return;
    const texto = this.nuevoComentario;
    this.nuevoComentario = '';

    // Agrega comentario localmente
    const nuevo: Comentario = {
      _id: Date.now().toString(),
      usuario: { _id: 'anon', username: 'Anónimo', profileImage: 'https://i.pravatar.cc/48?img=65' },
      texto,
      likesCount: 0,
      liked: false,
      createdAt: new Date().toISOString(),
      respuestas: []
    };
    this.comentarios.unshift(nuevo);
    this.totalComentarios++;
  }
}
