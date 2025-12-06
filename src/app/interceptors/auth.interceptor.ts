import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

/**
 * Interceptor que adiciona automaticamente o token de autenticação
 * em todas as requisições HTTP (exceto login e criação de médico)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Verifica se é uma requisição que não precisa de token
  // POST /login - login (OAuth2PasswordRequestForm)
  // POST /medicos - criar médico (registro) - apenas se for exatamente /medicos
  // POST /register - registro genérico (se existir)
  const url = req.url;
  const isLogin = url.includes('/login') && !url.includes('/login/'); // /login mas não /login/medico ou outras variações
  // Verifica se termina com /medicos mas não contém /medicos/ (para não bloquear /medicos/me, /medicos/{id}, etc)
  const isCreateMedico = url.endsWith('/medicos') && !url.includes('/medicos/');
  const isRegister = url.includes('/register');
  const isPublicEndpoint = isLogin || isCreateMedico || isRegister;
  
  // Obtém o token do localStorage
  const token = localStorage.getItem('token');
  
  // Se houver token e não for endpoint público, adiciona no header Authorization
  if (token && !isPublicEndpoint) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }
  
  return next(req);
};

