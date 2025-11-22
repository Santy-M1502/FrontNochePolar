import { Component } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

// Pipes
import { CapitalizePipe } from "../../pipes/capitalize.pipe";
import { HumanNumberPipe } from "../../pipes/human-number.pipe";
import { RelativeTimePipe } from "../../pipes/relative-time.pipe";

// Directivas
import { HasRoleDirective } from "../../directives/has-role.directive";
import { LoadingDirective } from "../../directives/loading.directive";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface User { name: string; role: string; }
interface PostStat { user: string; count: number; }
interface CommentStat { date?: string; postTitle?: string; count: number; id?: number; }
interface TimeRange { id: string; label: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    BaseChartDirective,
    HasRoleDirective,
    LoadingDirective,
    CapitalizePipe,
    HumanNumberPipe,
    RelativeTimePipe,
    CommonModule,
    FormsModule
  ],
  templateUrl: './estadisticas.html',
  styleUrls: ['./estadisticas.css']
})
export class Estadisticas {

  user: User = { name: 'Admin Nombre', role: 'admin' };

  timeRanges: TimeRange[] = [
    { id: '7d', label: 'Últimos 7 días' },
    { id: '30d', label: 'Últimos 30 días' },
    { id: '90d', label: 'Últimos 90 días' },
    { id: 'custom', label: 'Personalizado' }
  ];

  selectedRange: { [key: string]: string } = {
    posts: '30d',
    comments: '30d',
    commentsPerPost: '30d'
  };

  chartTypes: { [key: string]: ChartType } = {
    posts: 'bar',
    comments: 'line',
    commentsPerPost: 'pie'
  };

  postsByUser: PostStat[] = [
    { user: 'Ana', count: 12 },
    { user: 'Juan', count: 8 },
    { user: 'Pedro', count: 20 },
  ];

  commentsByTime: CommentStat[] = [
    { date: '2025-11-01', count: 10 },
    { date: '2025-11-02', count: 15 },
    { date: '2025-11-03', count: 7 },
  ];

  commentsPerPost: CommentStat[] = [
    { id: 1, postTitle: 'Primer post', count: 5 },
    { id: 2, postTitle: 'Segundo post', count: 12 },
    { id: 3, postTitle: 'Tercer post', count: 3 },
  ];

  isLoading = false;
  now = new Date();

  postsChartLabels = this.postsByUser.map(p => p.user);
  postsChartData: ChartData<'bar'> = {
    labels: this.postsChartLabels,
    datasets: [{ data: this.postsByUser.map(p => p.count), label: 'Publicaciones' }]
  };

  commentsChartLabels = this.commentsByTime.map(c => c.date || '');
  commentsChartData: ChartData<'line'> = {
    labels: this.commentsChartLabels,
    datasets: [{ data: this.commentsByTime.map(c => c.count), label: 'Comentarios' }]
  };

  commentsPerPostChartLabels = this.commentsPerPost.map(c => c.postTitle || '');
  commentsPerPostChartData: ChartData<'pie'> = {
    labels: this.commentsPerPostChartLabels,
    datasets: [{ data: this.commentsPerPost.map(c => c.count), label: 'Comentarios por publicación' }]
  };

  chartOptions: ChartOptions = { responsive: true, plugins: { legend: { display: true } } };

  onRangeChange(chartKey: 'posts'|'comments'|'commentsPerPost', event: Event) {
    const target = event.target as HTMLSelectElement | null;
    if(target) {
      this.selectedRange[chartKey] = target.value;
      console.log(`Rango de ${chartKey} cambiado a ${target.value}`);
    }
  }

  toggleChartType(chartKey: 'posts'|'comments'|'commentsPerPost') {
    const types: ChartType[] = ['bar', 'line', 'pie'];
    const currentIndex = types.indexOf(this.chartTypes[chartKey]);
    this.chartTypes[chartKey] = types[(currentIndex + 1) % types.length];
  }

  refreshChart(chartKey: string) {
    this.isLoading = true;
    setTimeout(() => this.isLoading = false, 1000);
  }

  exportChartData(chartKey: string) {
    console.log(`Exportando datos de ${chartKey}`);
  }

  openPostDetail(postId?: number) {
    console.log(`Abriendo detalle de post ${postId}`);
  }
  
}
