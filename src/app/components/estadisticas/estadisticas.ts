import { ChangeDetectorRef, Component } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { EstadisticasService, PublicacionesPorUsuario, ComentariosEnLapsoIntervalo, ComentariosPorPublicacion } from '../../services/estadisticas.service';
import { BaseChartDirective } from 'ng2-charts';

import { CapitalizePipe } from "../../pipes/capitalize.pipe";
import { HumanNumberPipe } from "../../pipes/human-number.pipe";
import { RelativeTimePipe } from "../../pipes/relative-time.pipe";

import { HasRoleDirective } from "../../directives/has-role.directive";
import { LoadingDirective } from "../../directives/loading.directive";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { PublicacionesService } from '../../services/publication.service';
Chart.register(...registerables);

import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

import { User as AuthUser } from '../../models/user.interface';
import { SideNavComponent } from "../side-nav/side-nav";
import { Chat } from "../chat/chat";
interface PostStat { user: string; count: number; }
interface CommentStat { date?: string; postTitle?: string; count: number; id?: number; }

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

  constructor(private estadisticasService: EstadisticasService, private publicationService: PublicacionesService, private cdr: ChangeDetectorRef, private authService: AuthService) {}

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

  isLoading = false;

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
      alert('Por favor, completa ambas fechas.');
      return false;
    }

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    if (fechaDesde > fechaHasta) {
      alert('La fecha "desde" no puede ser mayor que la fecha "hasta".');
      return false;
    }

    return true;
  }

  // ===================== POSTS =====================
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
            this.postsByUser = data.map(u => ({ user: u.username, count: u.cantidad }));
            this.postsChartLabels = this.postsByUser.map(p => p.user);
            this.postsChartData = {
              labels: this.postsChartLabels,
              datasets: [{ data: this.postsByUser.map(p => p.count), label: 'Publicaciones' }]
            };
          }
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
  }

  // ===================== COMENTARIOS =====================
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
            // Guardamos los datos para usar en la plantilla
            this.commentsByTime = data.map(d => ({ 
              date: `${new Date(d.desde).toLocaleDateString()} - ${new Date(d.hasta).toLocaleDateString()}`, 
              count: d.count 
            }));

            // Labels para el gráfico
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
        error: () => this.isLoading = false
      });
  }

  // ===================== COMENTARIOS POR POST =====================
  cargarComentariosPorPost() {
  if (!this.validarFechas(this.desdeCommentsPerPost, this.hastaCommentsPerPost)) return;

  this.isLoading = true;

  this.estadisticasService.comentariosPorPublicacion(this.desdeCommentsPerPost, this.hastaCommentsPerPost)
    .pipe(
      switchMap((data: ComentariosPorPublicacion[]) => {
        if (!data.length) {
          this.commentsPerPost = [];
          this.commentsPerPostChartLabels = [];
          this.commentsPerPostChartData = { labels: [], datasets: [] };
          return [];
        }

        // Crear un array de observables para traer los títulos de las publicaciones
        const observables = data.map(c => 
          this.publicationService.obtenerPublicacionPorId(c.publicacionId)
        );

        // forkJoin espera todos los observables y devuelve un array con los resultados
        return forkJoin(observables).pipe(
          switchMap(publicaciones => {
            // Mapear los datos al formato que espera el front
            this.commentsPerPost = publicaciones.map((pub, i) => ({
              id: parseInt(pub._id),
              postTitle: pub.titulo,
              count: data[i].cantidad
            }));
            
            this.commentsPerPostChartLabels = this.commentsPerPost.map(c => c.postTitle || '');
            this.commentsPerPostChartData = {
              labels: this.commentsPerPostChartLabels,
              datasets: [{ data: this.commentsPerPost.map(c => c.count), label: 'Comentarios por publicación' }]
            };
            return [];
          })
        );
      })
    )
    .subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false
    });
}

  toggleChartType(chartKey: 'posts'|'comments'|'commentsPerPost') {
    const types: ChartType[] = ['bar', 'line', 'pie'];
    const currentIndex = types.indexOf(this.chartTypes[chartKey]);
    this.chartTypes[chartKey] = types[(currentIndex + 1) % types.length];
  }

  exportChartData(chartKey: string) {
    console.log(`Exportando datos de ${chartKey}`);
  }

  openPostDetail(postId?: number) {
    console.log(`Abriendo detalle de post ${postId}`);
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
