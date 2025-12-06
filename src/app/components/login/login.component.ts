import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  crm: string = '';
  senha: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;
  patientId: number | null = null;
  returnUrl: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    // Não faz logout automático - permite que o usuário acesse a tela de login normalmente
  }

  ngOnInit() {
    // Verifica se há parâmetros de retorno (patientId ou returnUrl)
    this.route.queryParams.subscribe(params => {
      this.patientId = params['patientId'] ? +params['patientId'] : null;
      this.returnUrl = params['returnUrl'] || null;
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onCrmInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Mantém o valor como digitado (maiúsculas ou minúsculas)
    this.crm = input.value;
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.crm || !this.senha) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    // Remove espaços do início e fim
    const trimmedInput = this.crm.trim().replace(/\s/g, '');
    
    // Detecta se é CRM ou email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const crmPattern = /^\d{6}-[A-Za-z]{2}$/i;
    
    let loginIdentifier: string;
    
    if (emailPattern.test(trimmedInput)) {
      // É um email - mantém como está (case-insensitive mas preserva o original)
      loginIdentifier = trimmedInput.toLowerCase();
    } else if (crmPattern.test(trimmedInput)) {
      // É um CRM - normaliza para maiúsculas
      loginIdentifier = trimmedInput.toUpperCase();
    } else {
      this.errorMessage = 'Formato inválido. Use CRM (123456-SP) ou email (exemplo@email.com)';
      return;
    }

    // Usa o método assíncrono da API
    this.authService.login(loginIdentifier, this.senha).subscribe({
      next: (success) => {
        if (success) {
          // Verifica para onde redirecionar após login
          if (this.patientId) {
            // Se veio da tela de acesso público, volta para o perfil completo do paciente
            this.router.navigate(['/dashboard'], { queryParams: { id: this.patientId } });
          } else if (this.returnUrl) {
            // Se há returnUrl (do authGuard), redireciona para lá
            this.router.navigateByUrl(this.returnUrl);
          } else {
            // Caso padrão: vai para home
            this.router.navigate(['/home']);
          }
        } else {
          this.errorMessage = 'CRM/Email ou senha incorretos.';
        }
      },
      error: (error) => {
        // Tenta extrair mensagem de erro de diferentes formatos
        let errorMsg = 'Erro ao conectar com o servidor. Tente novamente.';
        
        // Prioridade: message do erro formatado > originalError > string
        if (error?.message) {
          errorMsg = error.message;
        } else if (error?.originalError) {
          // Tenta extrair do erro original
          const original = error.originalError;
          if (original.error?.detail) {
            // Formato FastAPI com array de detalhes
            if (Array.isArray(original.error.detail)) {
              const messages = original.error.detail.map((item: any) => {
                const field = item.loc && item.loc.length > 1 ? item.loc[item.loc.length - 1] : '';
                const msg = item.msg || '';
                return field ? `${field}: ${msg}` : msg;
              }).filter((m: string) => m).join('. ');
              errorMsg = messages || 'Erro de validação. Verifique os dados informados.';
            } else if (typeof original.error.detail === 'string') {
              errorMsg = original.error.detail;
            }
          } else if (original.error?.message) {
            errorMsg = original.error.message;
          } else if (original.message) {
            errorMsg = original.message;
          }
        } else if (typeof error === 'string') {
          errorMsg = error;
        }
        
        this.errorMessage = errorMsg;
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToHome() {
    // Permite navegar para home normalmente
    this.router.navigate(['/home']);
  }

  accessWithoutLogin() {
    // Verifica se há uma última rota acessada no sessionStorage
    const lastRoute = sessionStorage.getItem('lastRoute');
    
    // Lista de rotas públicas permitidas
    const publicRoutes = ['/home', '/search', '/public'];
    
    // Se houver uma última rota e ela for pública, redireciona para lá
    if (lastRoute && publicRoutes.some(route => lastRoute.startsWith(route))) {
      this.router.navigateByUrl(lastRoute);
    } else {
      // Caso padrão: redireciona para home
      this.router.navigate(['/home']);
    }
  }
}
