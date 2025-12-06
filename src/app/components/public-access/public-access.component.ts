import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { PatientLegacy } from '../../models/patient.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public-access',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-access.component.html',
  styleUrl: './public-access.component.css'
})
export class PublicAccessComponent implements OnInit {
  patient: PatientLegacy | undefined;
  patientId!: number;

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.patientId = +id;
        this.patientService.getPatientByIdLegacy(this.patientId).subscribe({
          next: (patient) => {
            this.patient = patient;
          },
          error: (error) => {
            console.error('Erro ao buscar paciente:', error);
            // Fallback para dados locais
            this.patient = this.patientService.getPatientByIdSync(this.patientId);
          }
        });
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToSearch() {
    this.router.navigate(['/search']);
  }
}
