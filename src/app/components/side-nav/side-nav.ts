import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <button class="hamburger" (click)="toggleMenu()">☰</button>

    <nav [class.open]="menuOpen">
      <ul>
        <li><a routerLink="/publicaciones" routerLinkActive="active">Inicio</a></li>
        <li><a routerLink="/tendencia" routerLinkActive="active">Tendencia</a></li>
        <li><a routerLink="/random" routerLinkActive="active">Random</a></li>
        <li><a routerLink="/desafio" routerLinkActive="active">Desafío Semanal</a></li>
        <li><a routerLink="/global" routerLinkActive="active">Global</a></li>
        <li><a routerLink="/perfil" routerLinkActive="active">Perfil</a></li>
        <li><a routerLink="/mensajes" routerLinkActive="active">Mensajes</a></li>
        <li><a routerLink="/config" routerLinkActive="active">Configuración</a></li>

        <div class="separator"></div>

        <li><a class="logout" (click)="cerrarSesion()">Cerrar Sesión</a></li>
      </ul>
    </nav>
  `,
  styles: [`
    :host {
      position: static;
      top: 0;
      left: 0;
      height: 90vh;
      z-index: 900;
    }

    /* NAV DESKTOP */
    nav {
      width: 220px;
      height: 100%;
      padding: 18px 0;
      border-right: 1px solid rgba(255,255,255,0.05);
      background: rgba(10, 16, 34, 0.55);
      backdrop-filter: blur(14px);
      color: #e2ebff;
      display: flex;
      flex-direction: column;
      transition: transform .3s ease;
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
    }

    nav ul {
      list-style: none;
      margin: 0;
      padding: 0 12px;
      display: flex;
      flex-direction: column;
      margin-top:3rem;
    }

    nav li {
      margin: 4px 0;
    }

    .separator {
      border-bottom: 1px solid rgba(255,255,255,0.08);
      margin: 8px 0 12px;
    }

    nav a {
      display: block;
      padding: 12px 14px;
      border-radius: 10px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      color: rgba(235,243,255,0.85);
      transition: background .22s, color .22s, transform .22s;
    }

    /* Hover */
    nav a:hover {
      background: rgba(255,255,255,0.08);
      color: #fff;
    }

    /* Active route */
    nav a.active {
      background: linear-gradient(90deg, #4571dd, #1d2f63);
      box-shadow: 0 6px 18px rgba(12, 32, 120, 0.45);
      color: #fff;
    }

    /* "Cerrar sesión" look */
    .logout {
      color: #ffb2b8 !important;
    }
    .logout:hover {
      background: rgba(255,80,90,0.1);
      color: #ff8890 !important;
    }

    /* HAMBURGER MOBILE */
    .hamburger {
      display: none;
      position: fixed;
      top: 16px;
      left: 20px;
      background: rgba(10,14,30,0.65);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
      color: #e9efff;
      font-size: 20px;
      z-index: 1000;
      backdrop-filter: blur(6px);
    }

    /* MOBILE MODE */
    @media (max-width: 820px) {
      nav {
        transform: translateX(-120%);
      }
      nav.open {
        transform: translateX(0);
      }
      .hamburger {
        display: block;
      }
    }

    /* Para que tu layout no se tape */
    @media (min-width: 821px) {
      :host {
        width: 220px;
      }
    }
  `]
})
export class SideNavComponent {
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  cerrarSesion() {
    console.log('Cerrar sesión...');
    // aquí irá tu lógica
  }
}
