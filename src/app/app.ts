import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('VitalKey');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Valida a sessão do usuário ao inicializar a aplicação
    this.authService.validateSession();

    // Rastreia a última rota acessada (exceto login e register)
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        // Lista de rotas que não devem ser salvas como última rota
        const excludedRoutes = ['/login', '/register'];
        
        // Salva apenas rotas públicas que não sejam login/register
        if (!excludedRoutes.some(route => url.startsWith(route))) {
          sessionStorage.setItem('lastRoute', url);
        }
      });
  }
}
