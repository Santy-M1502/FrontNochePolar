import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { timer, forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.html',
  styleUrls: ['./loading.css']
})
export class LoadingComponent implements OnInit {

  url = '../../../assets/loading.gif'

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    timer(1000).subscribe(() => {
      const token = localStorage.getItem('auth_token');

      if (token) {
        this.router.navigate(['/publicaciones']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
