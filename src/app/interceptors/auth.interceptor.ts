import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

/**
 * Interceptor que adiciona automaticamente o token de autenticação
 * em todas as requisições HTTP (exceto login e register)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtém o token do localStorage
  const token = localStorage.getItem('token');
  
  // Se houver token, adiciona no header Authorization
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }
  
  return next(req);
};

