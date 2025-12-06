import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ApiError {
  message: string;
  status: number;
  statusText: string;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  // Headers padrão para requisições JSON
  private defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  constructor(private http: HttpClient) {}

  /**
   * Realiza uma requisição GET
   * @param endpoint - Rota do endpoint (ex: '/users', '/patients')
   * @param params - Parâmetros de query opcionais
   * @param customHeaders - Headers customizados opcionais
   * @returns Observable com a resposta da API
   */
  get<T>(endpoint: string, params?: any, customHeaders?: HttpHeaders): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    const headers = customHeaders || this.defaultHeaders;

    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { 
      params: httpParams,
      headers 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Realiza uma requisição POST
   * @param endpoint - Rota do endpoint (ex: '/login', '/patients')
   * @param body - Dados a serem enviados no corpo da requisição
   * @param customHeaders - Headers customizados opcionais
   * @returns Observable com a resposta da API
   */
  post<T>(endpoint: string, body: any, customHeaders?: HttpHeaders): Observable<T> {
    const headers = customHeaders || this.defaultHeaders;
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Realiza uma requisição POST com form-urlencoded (para OAuth2)
   * @param endpoint - Rota do endpoint (ex: '/login')
   * @param formData - URLSearchParams com os dados do formulário
   * @returns Observable com a resposta da API
   */
  postFormData<T>(endpoint: string, formData: URLSearchParams): Observable<T> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, formData.toString(), { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Realiza uma requisição PUT
   * @param endpoint - Rota do endpoint (ex: '/users/1', '/patients/1')
   * @param body - Dados a serem enviados no corpo da requisição
   * @param customHeaders - Headers customizados opcionais
   * @returns Observable com a resposta da API
   */
  put<T>(endpoint: string, body: any, customHeaders?: HttpHeaders): Observable<T> {
    const headers = customHeaders || this.defaultHeaders;
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Realiza uma requisição DELETE
   * @param endpoint - Rota do endpoint (ex: '/users/1', '/patients/1')
   * @param customHeaders - Headers customizados opcionais
   * @returns Observable com a resposta da API
   */
  delete<T>(endpoint: string, customHeaders?: HttpHeaders): Observable<T> {
    const headers = customHeaders || this.defaultHeaders;
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Realiza uma requisição PATCH
   * @param endpoint - Rota do endpoint
   * @param body - Dados a serem enviados no corpo da requisição
   * @param customHeaders - Headers customizados opcionais
   * @returns Observable com a resposta da API
   */
  patch<T>(endpoint: string, body: any, customHeaders?: HttpHeaders): Observable<T> {
    const headers = customHeaders || this.defaultHeaders;
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, body, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Realiza upload de arquivo
   * @param endpoint - Rota do endpoint
   * @param file - Arquivo a ser enviado
   * @param additionalData - Dados adicionais opcionais
   * @returns Observable com a resposta da API
   */
  uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    // Para upload, não usar Content-Type: application/json
    const headers = new HttpHeaders();

    return this.http.post<T>(`${this.apiUrl}${endpoint}`, formData, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Tratamento centralizado de erros HTTP
   * @param error - Erro HTTP
   * @returns Observable com erro formatado
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    // Log detalhado do erro para debug
    console.error('=== ERRO HTTP DETALHADO ===');
    console.error('Status:', error.status);
    console.error('Status Text:', error.statusText);
    console.error('URL:', error.url);
    console.error('Erro completo (error.error):', error.error);
    console.error('Tipo do error.error:', typeof error.error);
    console.error('Keys do error.error:', error.error ? Object.keys(error.error) : 'null');
    
    // Se for erro 422, tenta extrair detalhes
    if (error.status === 422 && error.error) {
      console.error('=== DETALHES DO ERRO 422 ===');
      if (error.error.detail) {
        console.error('Detail (array):', error.error.detail);
        if (Array.isArray(error.error.detail)) {
          error.error.detail.forEach((item: any, index: number) => {
            console.error(`  Item ${index}:`, item);
            console.error(`    - loc:`, item.loc);
            console.error(`    - msg:`, item.msg);
            console.error(`    - type:`, item.type);
          });
        }
      }
      console.error('Erro completo serializado:', JSON.stringify(error.error, null, 2));
    }
    
    const apiError: ApiError = {
      message: error.error?.message || error.message || 'Erro desconhecido',
      status: error.status,
      statusText: error.statusText,
      error: error.error
    };

    console.error('Erro formatado para retorno:', apiError);
    return throwError(() => apiError);
  }

  /**
   * Constrói a URL completa do endpoint
   * @param endpoint - Rota do endpoint
   * @returns URL completa
   */
  getFullUrl(endpoint: string): string {
    return `${this.apiUrl}${endpoint}`;
  }
}

