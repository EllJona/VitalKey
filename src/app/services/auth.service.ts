import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  nome: string;
  email: string;
  senha: string;
  tipo: 'admin' | 'profissional' | 'paciente';
  celular?: string;
  especialidade?: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

/**
 * Interface para resposta do backend com dados do médico
 * Corresponde ao MedicoResponse do backend
 */
export interface MedicoResponse {
  id: number;
  nome: string;
  crm: string;
  especialidade?: string;
  email: string;
  ativo: boolean;
  senha?: string; // Geralmente não vem na resposta por segurança
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  
  // Usuários de teste (fallback local)
  private users: User[] = [
    {
      id: 1,
      nome: 'Maria Silva',
      email: 'admin@vitalkey.com',
      senha: 'admin123',
      tipo: 'admin',
      celular: '(11) 99999-9999'
    },
    {
      id: 2,
      nome: 'Dr. João Santos',
      email: 'medico@vitalkey.com',
      senha: 'medico123',
      tipo: 'profissional',
      celular: '(11) 98888-8888',
      especialidade: 'Cardiologia'
    },
    {
      id: 3,
      nome: 'Carlos Oliveira',
      email: 'paciente@vitalkey.com',
      senha: 'paciente123',
      tipo: 'paciente',
      celular: '(11) 97777-7777'
    }
  ];

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {
    // Recupera usuário do localStorage se existir
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  /**
   * Realiza login via API
   * @param login - CRM ou email do médico
   * @param senha - Senha do usuário
   * @returns Observable<boolean> - true se login foi bem-sucedido
   */
  login(login: string, senha: string): Observable<boolean> {
    // OAuth2PasswordRequestForm espera username e password no formato form-urlencoded
    const formData = new URLSearchParams();
    formData.set('username', login);  // OAuth2PasswordRequestForm usa 'username' para CRM ou email
    formData.set('password', senha);
    
    // Usa postFormData para enviar como application/x-www-form-urlencoded
    return this.apiService.postFormData<any>('/login', formData).pipe(
      switchMap(response => {
        // OAuth2 retorna: { access_token: "...", token_type: "bearer" }
        const token = response.access_token;
        
        if (!token) {
          console.error('Token não encontrado na resposta:', response);
          throw new Error('Token não recebido do servidor');
        }
        
        // Salva o token
        localStorage.setItem('token', token);
        
        // Busca os dados do médico logado usando GET /medico/me
        return this.getCurrentMedico().pipe(
          map(medico => {
            if (medico) {
              // Converte MedicoResponse para User
              const user: User = {
                id: medico.id,
                nome: medico.nome,
                email: medico.email || medico.crm, // Usa email se disponível, senão CRM
                senha: '', // Não salvar senha
                tipo: 'profissional',
                especialidade: medico.especialidade
              };
              
              this.currentUser = user;
              localStorage.setItem('currentUser', JSON.stringify(user));
              return true;
            } else {
              // Fallback: cria usuário básico se não conseguir buscar
              const user: User = {
                id: 0,
                nome: '',
                email: login,
                senha: '',
                tipo: 'profissional',
                celular: ''
              };
              this.currentUser = user;
              localStorage.setItem('currentUser', JSON.stringify(user));
              return true;
            }
          }),
          catchError(medicoError => {
            console.warn('Erro ao buscar dados do médico, usando dados básicos:', medicoError);
            // Fallback: cria usuário básico
            const user: User = {
              id: 0,
              nome: '',
              email: login,
              senha: '',
              tipo: 'profissional',
              celular: ''
            };
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return of(true);
          })
        );
      }),
      catchError(error => {
        console.error('Erro completo no login:', error);
        console.error('Status:', error.status);
        console.error('Mensagem:', error.message);
        console.error('Erro original:', error.originalError || error);
        
        // Se for erro 422 (validação), mostra mensagem específica
        if (error.status === 422) {
          console.error('Erro de validação 422 - detalhes:', error.originalError?.error?.detail);
          // A mensagem já foi formatada pelo interceptor
          return of(false);
        }
        
        // Se for erro 401 (não autorizado), não tenta fallback
        if (error.status === 401 || error.status === 403) {
          return of(false);
        }
        
        // Fallback para login local apenas em caso de erro de conexão
        if (error.status === 0 || error.status === 500) {
          console.warn('Usando fallback local devido a erro de conexão');
          const user = this.users.find(u => u.email === login && u.senha === senha);
          if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return of(true);
          }
        }
        
        return of(false);
      })
    );
  }

  /**
   * Realiza login de forma síncrona (compatibilidade com código existente)
   * @param crm - CRM do usuário
   * @param senha - Senha do usuário
   * @returns boolean - true se login foi bem-sucedido
   */
  loginSync(crm: string, senha: string): boolean {
    // Nota: O fallback local ainda usa email, mas isso é apenas para desenvolvimento
    const user = this.users.find(u => u.email === crm && u.senha === senha);
    
    if (user) {
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    
    return false;
  }

  /**
   * Cria um novo médico via API
   * @param medicoData - Dados do médico (MedicoCreate)
   * @returns Observable<MedicoResponse>
   */
  createMedico(medicoData: {
    nome: string;
    especialidade: string;
    crm: string;
    email: string;
    senha: string;
  }): Observable<MedicoResponse> {
    return this.apiService.post<MedicoResponse>('/medico', medicoData);
  }

  /**
   * Atualiza dados do médico logado via API
   * @param medicoData - Dados atualizados (parciais)
   * @returns Observable<MedicoResponse>
   */
  updateMedico(medicoData: Partial<{
    nome: string;
    email: string;
    senha: string;
  }>): Observable<MedicoResponse> {
    return this.apiService.patch<MedicoResponse>('/medico/me', medicoData);
  }

  /**
   * Atualiza dados de um médico específico via API (requer permissões admin)
   * @param id - ID do médico
   * @param medicoData - Dados atualizados (parciais)
   * @returns Observable<MedicoResponse>
   */
  updateMedicoById(id: number, medicoData: Partial<{
    nome: string;
    especialidade?: string;
    email: string;
    senha: string;
  }>): Observable<MedicoResponse> {
    return this.apiService.patch<MedicoResponse>(`/medico/${id}`, medicoData);
  }

  /**
   * Ativa/inativa um médico via API
   * @param id - ID do médico
   * @param ativo - Status ativo/inativo
   * @returns Observable<MedicoResponse>
   */
  updateMedicoStatus(id: number, ativo: boolean): Observable<MedicoResponse> {
    return this.apiService.patch<MedicoResponse>(`/medico/${id}/status`, { ativo });
  }

  /**
   * Registra novo usuário via API
   * @param userData - Dados do usuário
   * @returns Observable<boolean> - true se registro foi bem-sucedido
   */
  register(userData: Omit<User, 'id'>): Observable<boolean> {
    // Se for profissional, usa a rota de criar médico
    if (userData.tipo === 'profissional') {
      // Extrai CRM do email ou usa um padrão (ajustar conforme necessário)
      const crm = userData.email.split('@')[0] || '';
      
      return this.createMedico({
        nome: userData.nome,
        especialidade: userData.especialidade || '',
        crm: crm,
        email: userData.email,
        senha: userData.senha
      }).pipe(
        map(medico => {
          // Converte MedicoResponse para User
          const user: User = {
            id: medico.id,
            nome: medico.nome,
            email: medico.email || medico.crm,
            senha: '',
            tipo: 'profissional',
            especialidade: medico.especialidade
          };
          this.currentUser = user;
          localStorage.setItem('currentUser', JSON.stringify(user));
          return true;
        }),
        catchError(error => {
          console.error('Erro no registro de médico:', error);
          return of(false);
        })
      );
    }
    
    // Para outros tipos, mantém o comportamento antigo (se necessário)
    return this.apiService.post<User>('/register', userData).pipe(
      map(newUser => {
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        return true;
      }),
      catchError(error => {
        console.error('Erro no registro:', error);
        // Fallback para registro local em caso de erro na API
        if (this.users.find(u => u.email === userData.email)) {
          return of(false);
        }
        const localUser: User = {
          id: this.users.length + 1,
          ...userData
        };
        this.users.push(localUser);
        this.currentUser = localUser;
        localStorage.setItem('currentUser', JSON.stringify(localUser));
        return of(true);
      })
    );
  }

  /**
   * Registra novo usuário de forma síncrona (compatibilidade com código existente)
   * @param userData - Dados do usuário
   * @returns boolean - true se registro foi bem-sucedido
   */
  registerSync(userData: Omit<User, 'id'>): boolean {
    // Verifica se email já existe
    if (this.users.find(u => u.email === userData.email)) {
      return false;
    }

    const newUser: User = {
      id: this.users.length + 1,
      ...userData
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return true;
  }

  /**
   * Realiza logout do usuário
   * Remove token e dados do usuário do localStorage
   */
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  /**
   * Busca os dados do médico logado via GET /medico/me
   * Requer token de autenticação (adicionado automaticamente pelo interceptor)
   * @returns Observable<MedicoResponse | null>
   */
  getCurrentMedico(): Observable<MedicoResponse | null> {
    const token = this.getToken();
    
    if (!token) {
      console.warn('Nenhum token encontrado para buscar dados do médico');
      return of(null);
    }

    return this.apiService.get<MedicoResponse>('/medico/me').pipe(
      map(medico => {
        return medico;
      }),
      catchError(error => {
        console.error('Erro ao buscar dados do médico:', error);
        // Se for 401/403, o token pode estar inválido
        if (error.status === 401 || error.status === 403) {
          console.warn('Token inválido ou expirado, limpando sessão');
          this.logout();
        }
        return of(null);
      })
    );
  }

  /**
   * Obtém o usuário atual
   * @returns User | null
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Verifica se o usuário está autenticado
   * Verifica tanto o usuário quanto o token
   * @returns boolean
   */
  isAuthenticated(): boolean {
    const hasUser = this.currentUser !== null;
    const hasToken = !!localStorage.getItem('token');
    return hasUser && hasToken;
  }

  /**
   * Obtém o token de autenticação
   * @returns string | null
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verifica se o token está presente e válido
   * @returns boolean
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decodifica o token JWT (apenas para verificar se está no formato correto)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Verifica se o token expirou (se tiver campo 'exp')
      if (payload.exp) {
        const expirationDate = new Date(payload.exp * 1000);
        return expirationDate > new Date();
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return false;
    }
  }

  /**
   * Obtém o tipo do usuário atual
   * @returns 'admin' | 'profissional' | 'paciente' | null
   */
  getUserType(): 'admin' | 'profissional' | 'paciente' | null {
    return this.currentUser?.tipo || null;
  }

  /**
   * Verifica se o usuário atual é médico
   * @returns boolean
   */
  isMedico(): boolean {
    return this.currentUser?.tipo === 'profissional';
  }

  /**
   * Verifica se o usuário atual é admin
   * @returns boolean
   */
  isAdmin(): boolean {
    return this.currentUser?.tipo === 'admin';
  }

  /**
   * Verifica se o usuário atual é paciente
   * @returns boolean
   */
  isPaciente(): boolean {
    return this.currentUser?.tipo === 'paciente';
  }

  /**
   * Atualiza o token de autenticação
   * @param token - Novo token
   */
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Valida e atualiza a sessão do usuário
   * Útil para verificar se a sessão ainda é válida após recarregar a página
   * Se o token for válido, busca os dados atualizados do médico
   */
  validateSession(): boolean {
    const savedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      try {
        this.currentUser = JSON.parse(savedUser);
        
        // Verifica se o token ainda é válido
        if (this.hasValidToken()) {
          // Se o usuário não tiver dados completos (id = 0 ou nome vazio), busca do backend
          if (this.currentUser && (this.currentUser.id === 0 || !this.currentUser.nome)) {
            this.getCurrentMedico().subscribe({
              next: (medico) => {
                if (medico) {
                  const user: User = {
                    id: medico.id,
                    nome: medico.nome,
                    email: medico.email || medico.crm,
                    senha: '',
                    tipo: 'profissional',
                    especialidade: medico.especialidade
                  };
                  this.currentUser = user;
                  localStorage.setItem('currentUser', JSON.stringify(user));
                }
              },
              error: (error) => {
                // Mantém os dados locais se não conseguir buscar
              }
            });
          }
          return true;
        } else {
          // Token expirado, limpa a sessão
          this.logout();
          return false;
        }
      } catch (error) {
        console.error('Erro ao validar sessão:', error);
        this.logout();
        return false;
      }
    }

    return false;
  }
}

