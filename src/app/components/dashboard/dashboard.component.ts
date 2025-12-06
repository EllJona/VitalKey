import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { PatientLegacy } from '../../models/patient.model';
import { AuthService, MedicoResponse } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  patient: PatientLegacy | undefined;
  medico: MedicoResponse | undefined;
  isMedico: boolean = false;
  isLoading: boolean = true;

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
    alert('Funcionalidade de edição em desenvolvimento!');
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToSearch() {
    this.router.navigate(['/search']);
  }
}
