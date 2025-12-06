import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('VitalKey');

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Valida a sessão do usuário ao inicializar a aplicação
    this.authService.validateSession();
  }
}
