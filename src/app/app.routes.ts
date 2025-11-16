import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ProfileComponent } from './components/profile/profile';
import { authGuard } from './guards/auth.guard';
import { Publications } from './components/publications/publications';
import { PublicacionDetalleComponent } from './components/publicacion-detalle/publicacion-detalle';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'perfil', 
    component: ProfileComponent, 
    canActivate: [authGuard]
  },
  {
    path: 'publicaciones',
    component: Publications,
    canActivate: [authGuard]
  },
  {
    path: 'publicacion/:id',
    component: PublicacionDetalleComponent
  },
  { path: '**', redirectTo: '/login' }
];