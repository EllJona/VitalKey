import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PatientService } from '../../services/patient.service';
import { Patient, ContatoEmergencia } from '../../models/patient.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  tipoPerfil: 'paciente' | 'medico' = 'paciente';
  showPassword: boolean = false;
  errorMessage: string = '';
  aceitarTermos: boolean = false;

  // Campos comuns
  nome: string = '';
  email: string = '';
  senha: string = '';
  confirmarSenha: string = '';

  // Campos de médico
  crm: string = '';
  especialidade: string = '';

  // Campos de paciente
  alergias: string[] = [];
  alergiaInput: string = '';
  doencasCronicas: string[] = [];
  doencaInput: string = '';
  medicamentosContinuos: string[] = [];
  medicamentoInput: string = '';
  contatosEmergencia: ContatoEmergencia[] = [];
  contatoNome: string = '';
  contatoTelefone: string = '';
  tipoSanguineo: string = '';
  cirurgias: string[] = [];
  cirurgiaInput: string = '';
  internacoesPassadas: string[] = [];
  internacaoInput: string = '';
  alteracoesExames: string[] = [];
  alteracaoInput: string = '';
  historicoExames: string[] = [];
  exameInput: string = '';

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
    private authService: AuthService,
    private patientService: PatientService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tipo = params['tipo'];
      if (tipo === 'medico' || tipo === 'profissional') {
        this.tipoPerfil = 'medico';
      } else {
        this.tipoPerfil = 'paciente';
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Métodos auxiliares para arrays
  addAlergia() {
    if (this.alergiaInput.trim()) {
      this.alergias.push(this.alergiaInput.trim());
      this.alergiaInput = '';
    }
  }

  removeAlergia(index: number) {
    this.alergias.splice(index, 1);
  }

  addDoenca() {
    if (this.doencaInput.trim()) {
      this.doencasCronicas.push(this.doencaInput.trim());
      this.doencaInput = '';
    }
  }

  removeDoenca(index: number) {
    this.doencasCronicas.splice(index, 1);
  }

  addMedicamento() {
    if (this.medicamentoInput.trim()) {
      this.medicamentosContinuos.push(this.medicamentoInput.trim());
      this.medicamentoInput = '';
    }
  }

  removeMedicamento(index: number) {
    this.medicamentosContinuos.splice(index, 1);
  }

  addContatoEmergencia() {
    if (this.contatoNome.trim() && this.contatoTelefone.trim()) {
      this.contatosEmergencia.push({
        nome: this.contatoNome.trim(),
        telefone: this.contatoTelefone.trim()
      });
      this.contatoNome = '';
      this.contatoTelefone = '';
    }
  }

  removeContatoEmergencia(index: number) {
    this.contatosEmergencia.splice(index, 1);
  }

  addCirurgia() {
    if (this.cirurgiaInput.trim()) {
      this.cirurgias.push(this.cirurgiaInput.trim());
      this.cirurgiaInput = '';
    }
  }

  removeCirurgia(index: number) {
    this.cirurgias.splice(index, 1);
  }

  addInternacao() {
    if (this.internacaoInput.trim()) {
      this.internacoesPassadas.push(this.internacaoInput.trim());
      this.internacaoInput = '';
    }
  }

  removeInternacao(index: number) {
    this.internacoesPassadas.splice(index, 1);
  }

  addAlteracaoExame() {
    if (this.alteracaoInput.trim()) {
      this.alteracoesExames.push(this.alteracaoInput.trim());
      this.alteracaoInput = '';
    }
  }

  removeAlteracaoExame(index: number) {
    this.alteracoesExames.splice(index, 1);
  }

  addHistoricoExame() {
    if (this.exameInput.trim()) {
      this.historicoExames.push(this.exameInput.trim());
      this.exameInput = '';
    }
  }

  removeHistoricoExame(index: number) {
    this.historicoExames.splice(index, 1);
  }

  onSubmit() {
    this.errorMessage = '';

    // Validações comuns
    if (!this.nome) {
      this.errorMessage = 'Por favor, preencha o nome.';
      return;
    }

    // Validações específicas por tipo
    if (this.tipoPerfil === 'medico') {
      if (!this.email || !this.senha) {
        this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
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
    }

    if (!this.aceitarTermos) {
      this.errorMessage = 'Você precisa aceitar os Termos e condições de uso.';
      return;
    }

    // Validações específicas por tipo
    if (this.tipoPerfil === 'medico') {
      if (!this.crm) {
        this.errorMessage = 'Por favor, informe o CRM.';
        return;
      }
      if (!this.especialidade) {
        this.errorMessage = 'Por favor, selecione uma especialidade.';
        return;
      }

      // Criar médico
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
        } else {
      // Criar paciente
      const patientData: Omit<Patient, 'id'> = {
        nome: this.nome,
        alergias: this.alergias.length > 0 ? this.alergias : undefined,
        doencas_cronicas: this.doencasCronicas.length > 0 ? this.doencasCronicas : undefined,
        medicamentos_continuos: this.medicamentosContinuos.length > 0 ? this.medicamentosContinuos : undefined,
        contatos_emergencia: this.contatosEmergencia.length > 0 ? this.contatosEmergencia : undefined,
        informacoes_privadas: {
          tipo_sanguineo: this.tipoSanguineo || undefined,
          cirurgias: this.cirurgias.length > 0 ? this.cirurgias : undefined,
          internacoes_passadas: this.internacoesPassadas.length > 0 ? this.internacoesPassadas : undefined,
          alteracoes_exames: this.alteracoesExames.length > 0 ? this.alteracoesExames : undefined,
          historico_exames: this.historicoExames.length > 0 ? this.historicoExames : undefined
        }
      };

      this.patientService.createPatient(patientData).subscribe({
        next: (patient) => {
          // Após criar paciente, redireciona para login
          this.router.navigate(['/login'], { queryParams: { registered: true } });
      },
      error: (error) => {
          console.error('Erro ao registrar paciente:', error);
        this.errorMessage = 'Erro ao conectar com o servidor. Tente novamente.';
      }
    });
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  goToHome() {
    // Home é público, não precisa de autenticação
    this.router.navigate(['/home']);
  }
}

