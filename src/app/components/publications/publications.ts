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
export class Publications {
posts: Publicacion[] = [];
  newPost: string = '';
  filtro: string = 'ultimas';
  busqueda: string = '';

  constructor(private publicacionesService: PublicacionesService) {}

  ngOnInit() {
    this.aplicarFiltro();
  }

  sendPost() {
    if (!this.newPost.trim()) return;

    this.publicacionesService.crearPublicacion(
      { texto: this.newPost },
    ).subscribe((p) => {
      this.posts.unshift(p);
      this.newPost = '';
    });
  }

  aplicarFiltro() {
    switch (this.filtro) {
      case 'ultimas':
        this.publicacionesService.obtenerUltimas(20).subscribe(r => this.posts = r);
        break;
      case 'antiguas':
        this.publicacionesService.obtenerAntiguas(20).subscribe(r => this.posts = r);
        break;
      case 'populares':
        this.publicacionesService.obtenerPublicaciones(undefined, undefined, 'likes', 20)
          .subscribe(r => this.posts = r);
        break;
      case 'conImagen':
        this.publicacionesService.obtenerConImagen(20).subscribe(r => this.posts = r);
        break;
    }
  }

  buscar() {
    if (!this.busqueda.trim()) return this.aplicarFiltro();

    this.publicacionesService.buscar(this.busqueda, 20).subscribe(r => this.posts = r);
  }
}
