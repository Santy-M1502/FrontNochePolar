import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ProfileComponent } from './components/profile/profile';
import { AuthGuard } from './guards/auth.guard';
import { Publications } from './components/publications/publications';
import { PublicacionDetalleComponent } from './components/publicacion-detalle/publicacion-detalle';
import { LoadingComponent } from './components/loading/loading';

export const routes: Routes = [
  { path: '', redirectTo: '/loading', pathMatch: 'full' },
  { path: 'loading', component: LoadingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'perfil', 
    component: ProfileComponent, 
    canActivate: [AuthGuard]
  },
  {
    path: 'publicaciones',
    component: Publications,
    canActivate: [AuthGuard]
  },
  {
    path: 'publicacion/:id',
    component: PublicacionDetalleComponent
  },
  { path: '**', redirectTo: '/login' }
];