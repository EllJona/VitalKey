import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor para tratamento global de erros HTTP
 * Trata erros comuns como 401 (não autorizado), 403 (proibido), 500 (erro do servidor)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Verifica se é uma requisição de login ou register (não deve redirecionar em caso de erro)
  const isLoginOrRegister = req.url.includes('/login') || req.url.includes('/register');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro desconhecido';

      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente
        errorMessage = `Erro: ${error.error.message}`;
        console.error('Erro do cliente:', error.error);
      } else {
        // Erro do lado do servidor
        switch (error.status) {
          case 401:
            // Não autorizado - token inválido ou expirado
            // Se for login/register, não redireciona (deixa o componente tratar)
            if (!isLoginOrRegister) {
              errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
              localStorage.removeItem('token');
              localStorage.removeItem('currentUser');
              router.navigate(['/login']);
            } else {
              // Para login/register, retorna mensagem mais específica
              errorMessage = error.error?.message || 'Credenciais inválidas.';
            }
            break;
          case 422:
            // Erro de validação (Unprocessable Entity) - típico do FastAPI
            // Tenta extrair mensagens do array 'detail'
            if (error.error?.detail) {
              if (Array.isArray(error.error.detail)) {
                // Formato FastAPI: [{loc: [...], msg: "...", type: "..."}, ...]
                const messages = error.error.detail.map((item: any) => {
                  const field = item.loc && item.loc.length > 1 ? item.loc[item.loc.length - 1] : 'campo';
                  return item.msg || `${field}: ${item.type || 'erro de validação'}`;
                });
                errorMessage = messages.join('. ');
              } else if (typeof error.error.detail === 'string') {
                errorMessage = error.error.detail;
              } else {
                errorMessage = 'Erro de validação. Verifique os dados informados.';
              }
            } else {
              errorMessage = error.error?.message || 'Erro de validação. Verifique os dados informados.';
            }
            break;
          case 403:
            errorMessage = 'Você não tem permissão para realizar esta ação.';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado.';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          case 0:
            // CORS ou servidor não disponível
            errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
            break;
          default:
            errorMessage = error.error?.message || `Erro ${error.status}: ${error.statusText || 'Erro desconhecido'}`;
        }
        console.error(`Erro do servidor [${error.status}]:`, error.error);
        console.error('Erro completo:', error);
      }

      // Retorna um erro formatado
      return throwError(() => ({
        message: errorMessage,
        status: error.status,
        originalError: error
      }));
    })
  );
};

