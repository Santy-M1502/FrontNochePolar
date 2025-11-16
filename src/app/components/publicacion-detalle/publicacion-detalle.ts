import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicacionesService } from '../../services/publication.service';
import { ComentariosService } from '../../services/comentarios.service';
import { SideNavComponent } from "../side-nav/side-nav";
import { PublicacionComponent } from "../publication/publication";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Comentario } from '../../models/comentario.interface';
import { Chat } from "../chat/chat";

@Component({
  selector: 'app-publicacion-detalle',
  templateUrl: './publicacion-detalle.html',
  styleUrls: ['./publicacion-detalle.css'],
  imports: [SideNavComponent, PublicacionComponent, FormsModule, CommonModule, Chat],
})
export class PublicacionDetalleComponent implements OnInit {
  publicacion: any;

  // Estado pantalla
  cargando = true;
  error: string | null = null;

  // Comentarios
  comentarios: any[] = [];
  totalComentarios = 0;
  limit = 5;
  offset = 0;
  orden: 'recientes' | 'antiguos' | 'populares' = 'recientes';
  cargandoComentarios = false;
  cargandoMas = false;
  nuevoComentario = '';

  constructor(
    private route: ActivatedRoute,
    private publicacionesSrv: PublicacionesService,
    private comentariosSrv: ComentariosService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargarPublicacion(id);
  }

  cargarPublicacion(id: string) {
    this.publicacionesSrv.obtenerPublicacionPorId(id).subscribe({
      next: (pub) => {
        this.publicacion = pub;
        this.cargando = false;
        this.cargarComentarios(); // Primera carga
      },
      error: (err) => {
        this.error = 'No se encontró la publicación.';
        this.cargando = false;
      },
    });
  }

  cargarComentarios() {
    if (!this.publicacion?._id) return;
    this.cargandoComentarios = true;

    this.comentariosSrv
      .obtenerPorPublicacion(this.publicacion._id, this.limit, this.offset, this.orden)
      .subscribe({
        next: (res) => {
          this.comentarios = [...this.comentarios, ...res.comentarios];
          this.totalComentarios = res.total;
          this.cargandoComentarios = false;
        },
        error: () => {
          this.cargandoComentarios = false;
        },
      });
  }

  cargarMas() {
    this.cargandoMas = true;
    this.offset += this.limit;
    this.cargarComentarios();
    setTimeout(() => (this.cargandoMas = false), 500);
  }

  comentar() {
    if (!this.nuevoComentario.trim()) return;
    const texto = this.nuevoComentario;
    this.nuevoComentario = '';

    this.comentariosSrv.comentarPublicacion(this.publicacion._id, texto).subscribe({
      next: (nuevo) => {
        this.comentarios.unshift(nuevo); // Se agrega arriba
      },
      error: () => {},
    });
  }
}
