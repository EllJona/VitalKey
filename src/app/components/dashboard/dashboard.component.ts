import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { PatientLegacy } from '../../models/patient.model';
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
  editNome: string = '';
  editEmail: string = '';
  editSenha: string = '';
  editConfirmarSenha: string = '';
  editErrorMessage: string = '';
  isSaving: boolean = false;

  constructor(
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
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
    this.router.navigate(['/home']);
  }

  goToSearch() {
    this.router.navigate(['/search']);
  }
}
