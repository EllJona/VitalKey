import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
export class LoginComponent {
  crm: string = '';
  senha: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onCrmInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Converte para maiúsculas automaticamente
    this.crm = input.value.toUpperCase();
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.crm || !this.senha) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    // Normaliza o CRM para maiúsculas e remove espaços
    const normalizedCrm = this.crm.trim().toUpperCase().replace(/\s/g, '');

    // Valida formato do CRM (ex: 123456-SP)
    const crmPattern = /^\d{6}-[A-Z]{2}$/;
    if (!crmPattern.test(normalizedCrm)) {
      this.errorMessage = 'CRM inválido. Use o formato: 123456-SP';
      return;
    }

    // Usa o método assíncrono da API
    this.authService.login(normalizedCrm, this.senha).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'CRM ou senha incorretos.';
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
    this.router.navigate(['/home']);
  }
}
