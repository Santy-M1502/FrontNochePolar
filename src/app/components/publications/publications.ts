import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SideNavComponent } from "../side-nav/side-nav";
import { Chat } from "../chat/chat";
import { PublicacionComponent } from "../publication/publication";

import { Publicacion } from '../../models/publication.interface';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publication.service';

@Component({
  selector: 'app-post-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavComponent, Chat, PublicacionComponent],
  templateUrl: './publications.html',
  styleUrls: ['./publications.css']
})
export class Publications implements OnInit {
  posts: Publicacion[] = [];
  newPost: string = '';
  newTitle: string = '';
  filtro: string = 'ultimas';
  busqueda: string = '';
  selectedImage: File | null = null;
  usuarioActualId: string | null = null;

  errorTitulo: string = '';
  errorTexto: string = '';

  offset = 0;
  limit = 5;

  constructor(
    private publicacionesService: PublicacionesService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.usuarioActualId = this.auth.getUserId();
    this.aplicarFiltro();
  }

  private marcarLikes(posts: Publicacion[]): Publicacion[] {
    return posts.map(p => ({
      ...p,
      liked: this.usuarioActualId ? p.likes?.includes(this.usuarioActualId) : false
    }));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
    }
  }

  sendPost() {
    this.errorTitulo = '';
    this.errorTexto = '';

    if (this.newTitle.trim().length < 3) {
      this.errorTitulo = 'El título debe tener al menos 3 caracteres.';
    }
    if (this.newPost.trim().length < 3) {
      this.errorTexto = 'El texto debe tener al menos 3 caracteres.';
    }
    if (this.errorTitulo || this.errorTexto) return;

    const formData = new FormData();
    formData.append('titulo', this.newTitle.trim());
    formData.append('texto', this.newPost.trim());

    if (this.selectedImage) {
      formData.append('imagen', this.selectedImage);
    }

    this.publicacionesService.crearPublicacion(formData)
      .subscribe((p) => {
        const postConLike = { ...p, liked: false };
        this.posts.unshift(postConLike);

        this.newTitle = '';
        this.newPost = '';
        this.selectedImage = null;
        this.errorTitulo = '';
        this.errorTexto = '';

        this.aplicarFiltro();
      });
  }

  aplicarFiltro() {
    this.offset = 0;

    const handle = (r: Publicacion[]) => {
      this.posts = this.marcarLikes(r);
    };

    switch (this.filtro) {
      case 'ultimas':
        this.publicacionesService.obtenerUltimas(this.limit, this.offset)
          .subscribe(handle);
        break;
      case 'antiguas':
        this.publicacionesService.obtenerAntiguas(this.limit, this.offset)
          .subscribe(handle);
        break;
      case 'populares':
        this.publicacionesService.obtenerPublicaciones(undefined, undefined, 'likes', this.limit, this.offset)
          .subscribe(handle);
        break;
      case 'conImagen':
        this.publicacionesService.obtenerConImagen(this.limit, this.offset)
          .subscribe(handle);
        break;
    }
  }

  cargarMas() {
    this.offset += this.limit;

    const handle = (r: Publicacion[]) => {
      this.posts = [...this.posts, ...this.marcarLikes(r)];
    };

    switch (this.filtro) {
      case 'ultimas':
        this.publicacionesService.obtenerUltimas(this.limit, this.offset)
          .subscribe(handle);
        break;
      case 'antiguas':
        this.publicacionesService.obtenerAntiguas(this.limit, this.offset)
          .subscribe(handle);
        break;
      case 'populares':
        this.publicacionesService.obtenerPublicaciones(undefined, undefined, 'likes', this.limit, this.offset)
          .subscribe(handle);
        break;
      case 'conImagen':
        this.publicacionesService.obtenerConImagen(this.limit, this.offset)
          .subscribe(handle);
        break;
    }
  }

  buscar() {
    if (!this.busqueda.trim()) return this.aplicarFiltro();

    this.offset = 0;
    this.publicacionesService.buscar(this.busqueda, this.limit)
      .subscribe(r => this.posts = this.marcarLikes(r));
  }

  onPublicacionEliminada(id: string) {
    this.posts = this.posts.filter(p => p._id !== id);
  }
}