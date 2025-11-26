import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartData, ChartOptions, ChartType, Chart, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { EstadisticasService, PublicacionesPorUsuario, ComentariosPorPublicacion } from '../../services/estadisticas.service';
import { PublicacionesService } from '../../services/publication.service';
import { ComentariosService } from '../../services/comentarios.service';
import { AuthService } from '../../services/auth.service';

import { CapitalizePipe } from "../../pipes/capitalize.pipe";
import { HumanNumberPipe } from "../../pipes/human-number.pipe";
import { RelativeTimePipe } from "../../pipes/relative-time.pipe";
import { HasRoleDirective } from "../../directives/has-role.directive";

import { User as AuthUser } from '../../models/user.interface';
import { SideNavComponent } from "../side-nav/side-nav";
import { Chat } from "../chat/chat";
import { timeInterval } from 'rxjs';

Chart.register(...registerables);

interface PostStat { 
  user: string; 
  count: number; 
  userId?: string;
}

interface CommentStat { 
  date?: string; 
  postTitle?: string; 
  count: number; 
  id?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    BaseChartDirective,
    HasRoleDirective,
    CapitalizePipe,
    HumanNumberPipe,
    RelativeTimePipe,
    CommonModule,
    FormsModule,
    SideNavComponent,
    Chat
  ],
  templateUrl: './estadisticas.html',
  styleUrls: ['./estadisticas.css']
})
export class Estadisticas {

  constructor(
    private estadisticasService: EstadisticasService, 
    private publicationService: PublicacionesService,
    private comentariosService: ComentariosService,
    private authService: AuthService
  ) {}

  user: AuthUser | null = null;
  now = new Date()
  desdePosts = '';
  hastaPosts = '';
  desdeComments = '';
  hastaComments = '';
  desdeCommentsPerPost = '';
  hastaCommentsPerPost = '';

  chartTypes: { [key: string]: ChartType } = {
    posts: 'bar',
    comments: 'line',
    commentsPerPost: 'pie'
  };

  postsByUser: PostStat[] = [];
  commentsByTime: CommentStat[] = [];
  commentsPerPost: CommentStat[] = [];

  publicacionesDetalles: Map<number, any> = new Map();
  
  modalVisible = false;
  modalTitulo = '';
  modalContenido: any = null;
  modalTipo: 'usuario' | 'publicacion' | 'comentarios' = 'usuario';

  isLoading = false;
  cargandoModal = false;

  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  postsChartLabels: string[] = [];
  postsChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  commentsChartLabels: string[] = [];
  commentsChartData: ChartData<'line'> = { labels: [], datasets: [] };

  commentsPerPostChartLabels: string[] = [];
  commentsPerPostChartData: ChartData<'pie'> = { labels: [], datasets: [] };

  chartOptions: ChartOptions = { responsive: true, plugins: { legend: { display: true } } };

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
  }

  private validarFechas(desde: string, hasta: string): boolean {
    if (!desde || !hasta) {
      this.toastMessage = 'Ingresa una fecha'
      this.toastVisible = true
      setTimeout(() => {
        this.toastVisible = false
      }, 1500);
      return false;
    }

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    if (fechaDesde > fechaHasta) {
      this.toastMessage = 'Fecha Invalida'
      this.toastVisible = true
      setTimeout(() => {
        this.toastVisible = false
      }, 1500);
      return false;
    }

    return true;
  }

  cargarPosts() {
    if (!this.validarFechas(this.desdePosts, this.hastaPosts)) return;

    this.isLoading = true;
    
    this.estadisticasService.publicacionesPorUsuario(this.desdePosts, this.hastaPosts)
      .subscribe({
        next: (data: PublicacionesPorUsuario[]) => {
          if (!data.length) {
            alert('No hay publicaciones en el rango seleccionado.');
            this.postsByUser = [];
            this.postsChartLabels = [];
            this.postsChartData = { labels: [], datasets: [] };
          } else {
            this.postsByUser = data.map(u => ({ 
              user: u.username, 
              count: u.cantidad,
              userId: u.usuarioId
            }));
            
            this.postsChartLabels = this.postsByUser.map(p => p.user);
            this.postsChartData = {
              labels: this.postsChartLabels,
              datasets: [{ 
                data: this.postsByUser.map(p => p.count), 
                label: 'Publicaciones' 
              }]
            };
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar publicaciones:', error);
          this.isLoading = false;
        }
      });
  }

  cargarComentarios() {
    if (!this.validarFechas(this.desdeComments, this.hastaComments)) return;

    this.isLoading = true;
    
    this.estadisticasService.comentariosEnLapso(this.desdeComments, this.hastaComments)
      .subscribe({
        next: (data: { desde: string; hasta: string; count: number }[]) => {
          if (!data || data.length === 0 || data.every(d => d.count === 0)) {
            alert('No hay comentarios en el rango seleccionado.');
            this.commentsByTime = [];
            this.commentsChartLabels = [];
            this.commentsChartData = { labels: [], datasets: [] };
          } else {
            this.commentsByTime = data.map(d => ({ 
              date: `${new Date(d.desde).toLocaleDateString()} - ${new Date(d.hasta).toLocaleDateString()}`, 
              count: d.count 
            }));

            this.commentsChartLabels = this.commentsByTime.map(c => c.date || '');
            this.commentsChartData = {
              labels: this.commentsChartLabels,
              datasets: [{ 
                data: this.commentsByTime.map(c => c.count), 
                label: 'Comentarios' 
              }]
            };
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar comentarios:', error);
          this.isLoading = false;
        }
      });
  }

  cargarComentariosPorPost() {
    if (!this.validarFechas(this.desdeCommentsPerPost, this.hastaCommentsPerPost)) return;

    this.isLoading = true;
    this.publicacionesDetalles.clear();

    this.estadisticasService.comentariosPorPublicacion(this.desdeCommentsPerPost, this.hastaCommentsPerPost)
      .subscribe({
        next: (data: ComentariosPorPublicacion[]) => {
          if (!data.length) {
            this.commentsPerPost = [];
            this.commentsPerPostChartLabels = [];
            this.commentsPerPostChartData = { labels: [], datasets: [] };
            this.isLoading = false;
            return;
          }

          this.cargarDetallesPublicaciones(data);
        },
        error: (error) => {
          console.error('Error al cargar comentarios por publicación:', error);
          this.isLoading = false;
        }
      });
  }

  cargarDetallesPublicaciones(comentarios: ComentariosPorPublicacion[]) {
    let publicacionesCargadas = 0;
    const totalPublicaciones = comentarios.length;
    const publicacionesTemp: any[] = [];

    comentarios.forEach((comentario, index) => {
      this.publicationService.obtenerPublicacionPorId(comentario.publicacionId)
        .subscribe({
          next: (publicacion) => {
            publicacionesTemp[index] = {
              id: parseInt(publicacion._id),
              postTitle: publicacion.titulo,
              count: comentario.cantidad
            };

            this.publicacionesDetalles.set(parseInt(publicacion._id), publicacion);
            publicacionesCargadas++;

            if (publicacionesCargadas === totalPublicaciones) {
              this.commentsPerPost = publicacionesTemp;
              
              this.commentsPerPostChartLabels = this.commentsPerPost.map(c => c.postTitle || '');
              this.commentsPerPostChartData = {
                labels: this.commentsPerPostChartLabels,
                datasets: [{ 
                  data: this.commentsPerPost.map(c => c.count), 
                  label: 'Comentarios por publicación' 
                }]
              };
              
              this.isLoading = false;
            }
          },
          error: (error) => {
            console.error('Error al cargar publicación:', error);
            publicacionesCargadas++;
            
            if (publicacionesCargadas === totalPublicaciones) {
              this.isLoading = false;
            }
          }
        });
    });
  }

  abrirModalUsuario(userId?: string, username?: string) {
    if (!userId) return;
    
    this.modalTipo = 'usuario';
    this.modalTitulo = `Publicaciones de ${username}`;
    this.modalVisible = true;
    this.cargandoModal = true;
    
    this.publicationService.obtenerPorUsuario(userId, 100, 0)
      .subscribe({
        next: (publicaciones) => {
          this.modalContenido = publicaciones;
          this.cargandoModal = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.cargandoModal = false;
          this.cerrarModal();
        }
      });
  }

  abrirModalPublicacion(postId?: number) {
    if (!postId) return;
    
    const detalle = this.publicacionesDetalles.get(postId);
    if (!detalle) return;
    
    this.modalTipo = 'publicacion';
    this.modalTitulo = detalle.titulo || 'Publicación';
    this.modalVisible = true;
    this.cargandoModal = true;
    
    this.comentariosService.obtenerComentariosPorPublicacion2(postId.toString())
      .subscribe({
        next: (comentarios) => {
          this.modalContenido = {
            publicacion: detalle,
            comentarios: comentarios
          };
          this.cargandoModal = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.cargandoModal = false;
          this.cerrarModal();
        }
      });
  }

  cerrarModal() {
    this.modalVisible = false;
    this.modalContenido = null;
    this.modalTitulo = '';
  }

  getTotalLikes(publicaciones: any[]): number {
    if (!publicaciones) return 0;
    return publicaciones.reduce((sum, p) => sum + (p.likesCount || p.likes?.length || 0), 0);
  }

  toggleChartType(chartKey: 'posts'|'comments'|'commentsPerPost') {
    const types: ChartType[] = ['bar', 'line', 'pie'];
    const currentIndex = types.indexOf(this.chartTypes[chartKey]);
    this.chartTypes[chartKey] = types[(currentIndex + 1) % types.length];
  }

  rellenarUltimosDias(dias: number) {
    const hoy = new Date();
    const desde = new Date();
    desde.setDate(hoy.getDate() - dias);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    this.desdePosts = formatDate(desde);
    this.hastaPosts = formatDate(hoy);

    this.desdeComments = formatDate(desde);
    this.hastaComments = formatDate(hoy);

    this.desdeCommentsPerPost = formatDate(desde);
    this.hastaCommentsPerPost = formatDate(hoy);
  }
}