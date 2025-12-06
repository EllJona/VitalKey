import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PublicAccessComponent } from './components/public-access/public-access.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LandingComponent } from './components/landing/landing.component';
import { RegisterComponent } from './components/register/register.component';
import { SearchComponent } from './components/search/search';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }, // Público para criar conta
  { path: 'public/:id', component: PublicAccessComponent }, // Acesso público a perfis
  { 
    path: 'landing', 
    component: LandingComponent,
    canActivate: [authGuard] // Requer autenticação
  },
  { 
    path: 'home', 
    component: HomeComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'search', 
    component: SearchComponent,
    canActivate: [roleGuard(['admin', 'profissional'])] // Apenas admin e médico podem buscar
  },
  { path: '**', redirectTo: '/login' }
];
