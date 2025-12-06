import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rotas que requerem autenticação
 * Redireciona para /login se o usuário não estiver autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redireciona para login e salva a URL original para redirecionar após login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Guard que protege rotas que requerem tipo específico de usuário
 * @param allowedTypes - Tipos de usuário permitidos
 */
export const roleGuard = (allowedTypes: ('admin' | 'profissional' | 'paciente')[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const userType = authService.getUserType();
    if (userType && allowedTypes.includes(userType)) {
      return true;
    }

    // Usuário não tem permissão, redireciona para home
    router.navigate(['/home']);
    return false;
  };
};

