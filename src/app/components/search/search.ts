import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { PatientLegacy } from '../../models/patient.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  searchResults: PatientLegacy[] = [];
  isLoading: boolean = false;
  isMedico: boolean = false;

  constructor(
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Verifica se o usuário é médico
    this.isMedico = this.authService.isMedico();
    
    // Verifica se há uma query na URL
    this.route.queryParams.subscribe(params => {
      const query = params['q'];
      if (query) {
        this.searchQuery = query;
        this.performSearch();
      }
    });
  }

  performSearch() {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.searchResults = [];
      return;
    }

    this.isLoading = true;
    
    // Busca via API (usa formato legacy para compatibilidade com o template)
    this.patientService.searchPatientsLegacy(this.searchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao buscar pacientes:', error);
        this.isLoading = false;
        // Fallback para busca local
        this.searchResults = this.patientService.searchPatientsSync(this.searchQuery);
      }
    });
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.performSearch();
  }

  viewPatientProfile(patientId: number) {
    this.router.navigate(['/dashboard'], { queryParams: { id: patientId } });
  }

  viewPublicProfile(patientId: number) {
    this.router.navigate(['/public', patientId]);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}
