import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideNavComponent } from "../side-nav/side-nav";
import { Chat } from "../chat/chat";
import { PublicacionComponent } from "../publication/publication";
import { ScrollToTopComponent } from "../scroll-to-top/scroll-to-top";
import { Publicacion } from '../../models/publication.interface';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publication.service';
import { LoadingDirective } from '../../directives/loading.directive';

@Component({
  selector: 'app-post-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavComponent, Chat, PublicacionComponent, ScrollToTopComponent, LoadingDirective],
  templateUrl: './publications.html',
  styleUrls: ['./publications.css']
})
export class Publications implements OnInit {
  posts: Publicacion[] = [];
  newPost = '';
  newTitle = '';
  filtro = 'ultimas';
  busqueda = '';
  selectedImage: File | null = null;
  usuarioActualId: string | null = null;
  isUploading = false
  errorTitulo = '';
  errorTexto = '';
  fileError = '';

  offset = 0;
  limit = 5;

  private readonly MAX_TITLE = 100;
  private readonly MAX_TEXT = 1000;
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

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

  onTitleInput() {
    this.errorTitulo = '';
    if (this.newTitle.length > this.MAX_TITLE) {
      this.newTitle = this.newTitle.slice(0, this.MAX_TITLE);
      this.errorTitulo = `Máximo ${this.MAX_TITLE} caracteres.`;
    }
  }

  onTextInput() {
    this.errorTexto = '';
    if (this.newPost.length > this.MAX_TEXT) {
      this.newPost = this.newPost.slice(0, this.MAX_TEXT);
      this.errorTexto = `Máximo ${this.MAX_TEXT} caracteres.`;
    }
  }

  onFileSelected(event: any) {
    this.fileError = '';
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.fileError = 'Solo se permiten imágenes (JPG, PNG, GIF).';
      this.selectedImage = null;
      return;
    }

    if (file.size > this.MAX_IMAGE_SIZE) {
      this.fileError = 'La imagen es demasiado grande (máx. 5MB).';
      this.selectedImage = null;
      return;
    }

    this.selectedImage = file;
  }

  sendPost() {

    if (this.isUploading) return;

    this.isUploading = true;
    this.errorTitulo = '';
    this.errorTexto = '';
    this.fileError = '';

    const titulo = this.newTitle.trim();
    const texto = this.newPost.trim();

    if (titulo.length < 3) this.errorTitulo = 'El título debe tener al menos 3 caracteres.';
    if (texto.length < 3) this.errorTexto = 'El texto debe tener al menos 3 caracteres.';

    if (this.errorTitulo || this.errorTexto || this.fileError) {
      this.isUploading = false;
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('texto', texto);
    if (this.selectedImage) formData.append('imagen', this.selectedImage);

    this.publicacionesService.crearPublicacion(formData).subscribe({
      next: (p) => {
        const postConLike = { ...p, liked: false };
        this.posts.unshift(postConLike);

        this.newTitle = '';
        this.newPost = '';
        this.selectedImage = null;
        this.errorTitulo = '';
        this.errorTexto = '';
        this.fileError = '';

        this.aplicarFiltro();
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }

  aplicarFiltro() {
    this.offset = 0;
    const handle = (r: Publicacion[]) => this.posts = this.marcarLikes(r);

    switch (this.filtro) {
      case 'ultimas': this.publicacionesService.obtenerUltimas(this.limit, this.offset).subscribe(handle); break;
      case 'antiguas': this.publicacionesService.obtenerAntiguas(this.limit, this.offset).subscribe(handle); break;
      case 'populares': this.publicacionesService.obtenerPublicaciones(undefined, undefined, 'likes', this.limit, this.offset).subscribe(handle); break;
      case 'conImagen': this.publicacionesService.obtenerConImagen(this.limit, this.offset).subscribe(handle); break;
    }
  }

  cargarMas() {
    this.offset += this.limit;
    const handle = (r: Publicacion[]) => this.posts = [...this.posts, ...this.marcarLikes(r)];

    switch (this.filtro) {
      case 'ultimas': this.publicacionesService.obtenerUltimas(this.limit, this.offset).subscribe(handle); break;
      case 'antiguas': this.publicacionesService.obtenerAntiguas(this.limit, this.offset).subscribe(handle); break;
      case 'populares': this.publicacionesService.obtenerPublicaciones(undefined, undefined, 'likes', this.limit, this.offset).subscribe(handle); break;
      case 'conImagen': this.publicacionesService.obtenerConImagen(this.limit, this.offset).subscribe(handle); break;
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
