import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Exemplo de uso do ApiService
    // Você pode descomentar e adaptar conforme necessário
    
    // Exemplo 1: GET request
    // this.apiService.get('/users').subscribe({
    //   next: (users) => {
    //     console.log('Usuários:', users);
    //   },
    //   error: (error) => {
    //     console.error('Erro ao buscar usuários:', error);
    //   }
    // });

    // Exemplo 2: POST request
    // const loginPayload = { email: 'user@example.com', senha: 'password123' };
    // this.apiService.post('/login', loginPayload).subscribe({
    //   next: (response) => {
    //     console.log('Login realizado:', response);
    //   },
    //   error: (error) => {
    //     console.error('Erro no login:', error);
    //   }
    // });

    // Exemplo 3: GET com parâmetros
    // this.apiService.get('/patients', { search: 'João' }).subscribe({
    //   next: (patients) => {
    //     console.log('Pacientes encontrados:', patients);
    //   }
    // });
  }

  goToPublicAccess() {
    this.router.navigate(['/public/1']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToSearch() {
    this.router.navigate(['/search']);
  }
}
