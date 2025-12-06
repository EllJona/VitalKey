import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  selectedProfile: 'admin' | 'profissional' | 'paciente' | null = null;

  constructor(private router: Router) {}

  selectProfile(profile: 'admin' | 'profissional' | 'paciente') {
    this.selectedProfile = profile;
  }

  proceedToRegister() {
    if (this.selectedProfile) {
      this.router.navigate(['/register'], { 
        queryParams: { tipo: this.selectedProfile } 
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}

