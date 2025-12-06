import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { PatientLegacy, legacyToPatient, ContatoEmergencia } from '../../models/patient.model';
import { AuthService, MedicoResponse } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  patient: PatientLegacy | undefined;
  medico: MedicoResponse | undefined;
  isMedico: boolean = false;
  isLoading: boolean = true;
  showEditModal: boolean = false;
  showEditPatientModal: boolean = false;
  editNome: string = '';
  editEmail: string = '';
  editSenha: string = '';
  editConfirmarSenha: string = '';
  editErrorMessage: string = '';
  isSaving: boolean = false;
  
  // Variáveis para edição de paciente
  editPatientNome: string = '';
  editPatientAlergias: string[] = [];
  editPatientAlergiaInput: string = '';
  editPatientDoencas: string[] = [];
  editPatientDoencaInput: string = '';
  editPatientMedicamentos: string[] = [];
  editPatientMedicamentoInput: string = '';
  editPatientContatos: ContatoEmergencia[] = [];
  editPatientContatoNome: string = '';
  editPatientContatoTelefone: string = '';
  editPatientTipoSanguineo: string = '';
  editPatientCirurgias: string[] = [];
  editPatientCirurgiaInput: string = '';
  editPatientInternacoes: string[] = [];
  editPatientInternacaoInput: string = '';
  editPatientAlteracoesExames: string[] = [];
  editPatientAlteracaoInput: string = '';
  editPatientHistoricoExames: string[] = [];
  editPatientExameInput: string = '';
  editPatientErrorMessage: string = '';
  isSavingPatient: boolean = false;
  currentPatientId: number | null = null;

  constructor(
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // O authGuard já verifica autenticação antes de carregar o componente
    // Aqui apenas carregamos os dados do usuário
    
    // Verifica se o usuário é médico
    this.isMedico = this.authService.isMedico();
    
    // Verifica se há um ID na query string para buscar paciente específico
    this.route.queryParams.subscribe(params => {
      const patientId = params['id'];
      
      if (patientId) {
        // Se houver ID na query, busca informações do paciente
        this.loadPatient(+patientId);
      } else {
        // Se não houver ID, busca dados do médico logado via GET /me
        this.loadMedico();
      }
    });
  }

  /**
   * Carrega os dados do médico logado via GET /me
   */
  loadMedico() {
    this.isLoading = true;
    
    this.authService.getCurrentMedico().subscribe({
      next: (medico) => {
        this.medico = medico || undefined;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao buscar dados do médico:', error);
        this.isLoading = false;
        // Se não conseguir buscar, redireciona para login
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
        }
      }
    });
  }

  /**
   * Carrega os dados de um paciente específico
   */
  loadPatient(id: number) {
    this.isLoading = true;
    this.currentPatientId = id; // Define o ID do paciente
    
    if (this.isMedico) {
      this.patientService.getPatientCompletoLegacy(id).subscribe({
        next: (patient) => {
          this.patient = patient;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao buscar paciente completo:', error);
          // Fallback: tenta buscar informações básicas
          this.patientService.getPatientByIdLegacy(id).subscribe({
            next: (patient) => {
              this.patient = patient;
              this.isLoading = false;
            },
            error: (fallbackError) => {
              console.error('Erro ao buscar paciente básico:', fallbackError);
              // Fallback final: dados locais
              this.patient = this.patientService.getPatientByIdSync(id);
              this.isLoading = false;
            }
          });
        }
      });
    } else {
      this.patientService.getPatientByIdLegacy(id).subscribe({
        next: (patient) => {
          this.patient = patient;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao buscar paciente:', error);
          // Fallback para dados locais
          this.patient = this.patientService.getPatientByIdSync(id);
          this.isLoading = false;
        }
      });
    }
  }

  editInfo() {
    if (this.medico) {
      this.editNome = this.medico.nome;
      this.editEmail = this.medico.email || '';
      this.editSenha = '';
      this.editConfirmarSenha = '';
      this.editErrorMessage = '';
      this.showEditModal = true;
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editNome = '';
    this.editEmail = '';
    this.editSenha = '';
    this.editConfirmarSenha = '';
    this.editErrorMessage = '';
  }

  saveMedicoInfo() {
    this.editErrorMessage = '';
    this.isSaving = true;

    // Validações
    if (!this.editNome || !this.editEmail) {
      this.editErrorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      this.isSaving = false;
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editEmail)) {
      this.editErrorMessage = 'Por favor, insira um e-mail válido.';
      this.isSaving = false;
      return;
    }

    // Se senha foi preenchida, validar
    if (this.editSenha) {
      if (this.editSenha.length < 8) {
        this.editErrorMessage = 'A senha precisa ter pelo menos 8 caracteres.';
        this.isSaving = false;
        return;
      }

      if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(this.editSenha)) {
        this.editErrorMessage = 'A senha precisa ter pelo menos 8 caracteres incluindo letras e números.';
        this.isSaving = false;
        return;
      }

      if (this.editSenha !== this.editConfirmarSenha) {
        this.editErrorMessage = 'As senhas não coincidem.';
        this.isSaving = false;
        return;
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      nome: this.editNome,
      email: this.editEmail
    };

    // Só incluir senha se foi preenchida
    if (this.editSenha) {
      updateData.senha = this.editSenha;
    }

    // Chamar API para atualizar
    this.authService.updateMedico(updateData).subscribe({
      next: (updatedMedico) => {
        this.medico = updatedMedico;
        // Atualizar também o currentUser no localStorage
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          currentUser.nome = updatedMedico.nome;
          currentUser.email = updatedMedico.email;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        this.closeEditModal();
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar médico:', error);
        this.editErrorMessage = 'Erro ao atualizar informações. Tente novamente.';
        this.isSaving = false;
      }
    });
  }

  /**
   * Separa os contatos de emergência por vírgula e retorna um array
   * @param contatoEmergencia - String com contatos separados por vírgula
   * @returns Array de strings com cada contato
   */
  getContatosEmergencia(contatoEmergencia: string): string[] {
    if (!contatoEmergencia) {
      return [];
    }
    // Separa por vírgula e remove espaços em branco no início/fim
    return contatoEmergencia.split(',').map(contato => contato.trim()).filter(contato => contato.length > 0);
  }

  goToHome() {
    // Home é público, não precisa de autenticação
    this.router.navigate(['/home']);
  }

  goToSearch() {
    this.router.navigate(['/search']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  // Métodos para edição de paciente
  editPatientInfo() {
    console.log('editPatientInfo() chamado');
    console.log('patient:', this.patient);
    console.log('currentPatientId:', this.currentPatientId);
    console.log('isMedico:', this.isMedico);
    
    if (!this.patient) {
      console.error('Paciente não encontrado');
      alert('Paciente não encontrado');
      return;
    }
    
    // Usa currentPatientId se disponível, caso contrário usa o ID do paciente
    if (!this.currentPatientId) {
      if (this.patient.id) {
        this.currentPatientId = this.patient.id;
        console.log('Usando ID do paciente como fallback:', this.currentPatientId);
      } else {
        console.error('ID do paciente não encontrado');
        alert('ID do paciente não encontrado');
        return;
      }
    }
    
    // Inicializa os campos do formulário com os dados do paciente
    this.editPatientNome = this.patient.nome || '';
    this.editPatientAlergias = this.patient.alergias ? [...this.patient.alergias] : [];
    this.editPatientDoencas = this.patient.doencas ? [...this.patient.doencas] : [];
    this.editPatientMedicamentos = this.patient.medicamentos ? [...this.patient.medicamentos] : [];
    
    // Parse contato de emergência
    this.editPatientContatos = [];
    if (this.patient.contatoEmergencia) {
      const contatos = this.getContatosEmergencia(this.patient.contatoEmergencia);
      contatos.forEach(contato => {
        const parts = contato.split(' - ');
        if (parts.length >= 2) {
          this.editPatientContatos.push({
            nome: parts[0],
            telefone: parts.slice(1).join(' - ')
          });
        }
      });
    }
    
    this.editPatientTipoSanguineo = this.patient.tipoSanguineo || '';
    this.editPatientCirurgias = this.patient.cirurgias ? [...this.patient.cirurgias] : [];
    this.editPatientInternacoes = this.patient.internacoes ? [...this.patient.internacoes] : [];
    this.editPatientAlteracoesExames = [];
    this.editPatientHistoricoExames = this.patient.exames ? [...this.patient.exames] : [];
    
    // Limpa campos de input
    this.editPatientAlergiaInput = '';
    this.editPatientDoencaInput = '';
    this.editPatientMedicamentoInput = '';
    this.editPatientContatoNome = '';
    this.editPatientContatoTelefone = '';
    this.editPatientCirurgiaInput = '';
    this.editPatientInternacaoInput = '';
    this.editPatientAlteracaoInput = '';
    this.editPatientExameInput = '';
    this.editPatientErrorMessage = '';
    
    // Abre o modal
    console.log('Abrindo modal - showEditPatientModal será true');
    this.showEditPatientModal = true;
    console.log('showEditPatientModal após setar:', this.showEditPatientModal);
    
    // Força detecção de mudanças
    this.cdr.detectChanges();
    console.log('Change detection executado');
  }

  closeEditPatientModal() {
    this.showEditPatientModal = false;
    this.editPatientNome = '';
    this.editPatientAlergias = [];
    this.editPatientAlergiaInput = '';
    this.editPatientDoencas = [];
    this.editPatientDoencaInput = '';
    this.editPatientMedicamentos = [];
    this.editPatientMedicamentoInput = '';
    this.editPatientContatos = [];
    this.editPatientContatoNome = '';
    this.editPatientContatoTelefone = '';
    this.editPatientTipoSanguineo = '';
    this.editPatientCirurgias = [];
    this.editPatientCirurgiaInput = '';
    this.editPatientInternacoes = [];
    this.editPatientInternacaoInput = '';
    this.editPatientAlteracoesExames = [];
    this.editPatientAlteracaoInput = '';
    this.editPatientHistoricoExames = [];
    this.editPatientExameInput = '';
    this.editPatientErrorMessage = '';
  }

  // Métodos auxiliares para arrays de paciente
  addPatientAlergia() {
    if (this.editPatientAlergiaInput.trim()) {
      this.editPatientAlergias.push(this.editPatientAlergiaInput.trim());
      this.editPatientAlergiaInput = '';
    }
  }

  removePatientAlergia(index: number) {
    this.editPatientAlergias.splice(index, 1);
  }

  addPatientDoenca() {
    if (this.editPatientDoencaInput.trim()) {
      this.editPatientDoencas.push(this.editPatientDoencaInput.trim());
      this.editPatientDoencaInput = '';
    }
  }

  removePatientDoenca(index: number) {
    this.editPatientDoencas.splice(index, 1);
  }

  addPatientMedicamento() {
    if (this.editPatientMedicamentoInput.trim()) {
      this.editPatientMedicamentos.push(this.editPatientMedicamentoInput.trim());
      this.editPatientMedicamentoInput = '';
    }
  }

  removePatientMedicamento(index: number) {
    this.editPatientMedicamentos.splice(index, 1);
  }

  addPatientContato() {
    if (this.editPatientContatoNome.trim() && this.editPatientContatoTelefone.trim()) {
      this.editPatientContatos.push({
        nome: this.editPatientContatoNome.trim(),
        telefone: this.editPatientContatoTelefone.trim()
      });
      this.editPatientContatoNome = '';
      this.editPatientContatoTelefone = '';
    }
  }

  removePatientContato(index: number) {
    this.editPatientContatos.splice(index, 1);
  }

  addPatientCirurgia() {
    if (this.editPatientCirurgiaInput.trim()) {
      this.editPatientCirurgias.push(this.editPatientCirurgiaInput.trim());
      this.editPatientCirurgiaInput = '';
    }
  }

  removePatientCirurgia(index: number) {
    this.editPatientCirurgias.splice(index, 1);
  }

  addPatientInternacao() {
    if (this.editPatientInternacaoInput.trim()) {
      this.editPatientInternacoes.push(this.editPatientInternacaoInput.trim());
      this.editPatientInternacaoInput = '';
    }
  }

  removePatientInternacao(index: number) {
    this.editPatientInternacoes.splice(index, 1);
  }

  addPatientAlteracaoExame() {
    if (this.editPatientAlteracaoInput.trim()) {
      this.editPatientAlteracoesExames.push(this.editPatientAlteracaoInput.trim());
      this.editPatientAlteracaoInput = '';
    }
  }

  removePatientAlteracaoExame(index: number) {
    this.editPatientAlteracoesExames.splice(index, 1);
  }

  addPatientHistoricoExame() {
    if (this.editPatientExameInput.trim()) {
      this.editPatientHistoricoExames.push(this.editPatientExameInput.trim());
      this.editPatientExameInput = '';
    }
  }

  removePatientHistoricoExame(index: number) {
    this.editPatientHistoricoExames.splice(index, 1);
  }

  savePatientInfo() {
    this.editPatientErrorMessage = '';
    this.isSavingPatient = true;

    if (!this.editPatientNome || !this.currentPatientId) {
      this.editPatientErrorMessage = 'Erro: dados inválidos.';
      this.isSavingPatient = false;
      return;
    }

    // Preparar dados para atualização
    const updateData: any = {
      nome: this.editPatientNome,
      alergias: this.editPatientAlergias.length > 0 ? this.editPatientAlergias : undefined,
      doencas_cronicas: this.editPatientDoencas.length > 0 ? this.editPatientDoencas : undefined,
      medicamentos_continuos: this.editPatientMedicamentos.length > 0 ? this.editPatientMedicamentos : undefined,
      contatos_emergencia: this.editPatientContatos.length > 0 ? this.editPatientContatos : undefined,
      informacoes_privadas: {
        tipo_sanguineo: this.editPatientTipoSanguineo || undefined,
        cirurgias: this.editPatientCirurgias.length > 0 ? this.editPatientCirurgias : undefined,
        internacoes_passadas: this.editPatientInternacoes.length > 0 ? this.editPatientInternacoes : undefined,
        alteracoes_exames: this.editPatientAlteracoesExames.length > 0 ? this.editPatientAlteracoesExames : undefined,
        historico_exames: this.editPatientHistoricoExames.length > 0 ? this.editPatientHistoricoExames : undefined
      }
    };

    // Chamar API para atualizar
    this.patientService.updatePatient(this.currentPatientId, updateData).subscribe({
      next: (updatedPatient) => {
        // Recarrega os dados do paciente
        if (this.currentPatientId) {
          this.loadPatient(this.currentPatientId);
        }
        this.closeEditPatientModal();
        this.isSavingPatient = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar paciente:', error);
        this.editPatientErrorMessage = 'Erro ao atualizar informações. Tente novamente.';
        this.isSavingPatient = false;
      }
    });
  }
}
