import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  tipoPerfil: 'admin' | 'profissional' | 'paciente' = 'paciente';
  nome: string = '';
  email: string = '';
  celular: string = '';
  crm: string = '';
  especialidade: string = '';
  senha: string = '';
  confirmarSenha: string = '';
  aceitarTermos: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;

  especialidades = [
    'Cardiologia',
    'Dermatologia',
    'Endocrinologia',
    'Ginecologia',
    'Neurologia',
    'Ortopedia',
    'Pediatria',
    'Psiquiatria',
    'Urologia',
    'Outra'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tipo = params['tipo'];
      if (tipo && ['admin', 'profissional', 'paciente'].includes(tipo)) {
        this.tipoPerfil = tipo;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMessage = '';

    // Validações
    if (!this.nome || !this.email || !this.celular || !this.senha) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    if (this.tipoPerfil === 'profissional') {
      if (!this.crm) {
        this.errorMessage = 'Por favor, informe o CRM.';
        return;
      }
      if (!this.especialidade) {
        this.errorMessage = 'Por favor, selecione uma especialidade.';
        return;
      }
    }

    if (this.senha.length < 8) {
      this.errorMessage = 'A senha precisa ter pelo menos 8 caracteres.';
      return;
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(this.senha)) {
      this.errorMessage = 'A senha precisa ter pelo menos 8 caracteres incluindo letras e números.';
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    if (!this.aceitarTermos) {
      this.errorMessage = 'Você precisa aceitar os Termos e condições de uso.';
      return;
    }

    // Registro via API
    // Se for profissional, usa createMedico diretamente
    if (this.tipoPerfil === 'profissional') {
      this.authService.createMedico({
        nome: this.nome,
        especialidade: this.especialidade,
        crm: this.crm,
        email: this.email,
        senha: this.senha
      }).subscribe({
        next: (medico) => {
          // Converte MedicoResponse para User e salva
          const user = {
            id: medico.id,
            nome: medico.nome,
            email: medico.email,
            senha: '',
            tipo: 'profissional' as const,
            especialidade: medico.especialidade
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Erro ao registrar médico:', error);
          this.errorMessage = 'Erro ao conectar com o servidor. Tente novamente.';
        }
      });
      return;
    }

    // Para outros tipos, usa o método register padrão
    this.authService.register({
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      tipo: this.tipoPerfil,
      celular: this.celular,
      especialidade: undefined // Não é profissional, então não precisa de especialidade
    }).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'Este e-mail já está cadastrado.';
        }
      },
      error: (error) => {
        console.error('Erro ao registrar:', error);
        this.errorMessage = 'Erro ao conectar com o servidor. Tente novamente.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}

