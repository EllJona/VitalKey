# Guia de Uso da API Service

Este documento descreve como usar o `ApiService` para fazer requisições HTTP ao backend.

## Configuração

O `ApiService` está configurado para usar a URL base definida em `src/environments/environment.ts`:
- **Desenvolvimento**: `https://vitalkey.onrender.com`
- **Produção**: `https://vitalkey.onrender.com`

## Métodos Disponíveis

### GET - Buscar Dados

```typescript
// Buscar todos os usuários
this.apiService.get('/users').subscribe({
  next: (users) => console.log(users),
  error: (error) => console.error(error)
});

// Buscar com parâmetros de query
this.apiService.get('/patients', { search: 'João', status: 'ativo' }).subscribe({
  next: (patients) => console.log(patients)
});
```

### POST - Criar/Enviar Dados

```typescript
// Login
const loginData = { email: 'user@example.com', senha: 'password123' };
this.apiService.post('/login', loginData).subscribe({
  next: (response) => {
    console.log('Login realizado:', response);
  },
  error: (error) => console.error('Erro no login:', error)
});

// Criar novo paciente
const patientData = {
  nome: 'João Silva',
  tipoSanguineo: 'O+',
  alergias: ['Amendoim']
};
this.apiService.post('/patients', patientData).subscribe({
  next: (patient) => console.log('Paciente criado:', patient)
});
```

### PUT - Atualizar Dados

```typescript
// Atualizar paciente
const updatedData = { nome: 'João Santos', alergias: ['Amendoim', 'Látex'] };
this.apiService.put('/patients/1', updatedData).subscribe({
  next: (patient) => console.log('Paciente atualizado:', patient)
});
```

### PATCH - Atualização Parcial

```typescript
// Atualizar apenas alguns campos
this.apiService.patch('/patients/1', { alergias: ['Amendoim'] }).subscribe({
  next: (patient) => console.log('Paciente atualizado:', patient)
});
```

### DELETE - Deletar Dados

```typescript
// Deletar paciente
this.apiService.delete('/patients/1').subscribe({
  next: () => console.log('Paciente deletado'),
  error: (error) => console.error('Erro ao deletar:', error)
});
```

### Upload de Arquivo

```typescript
// Upload de arquivo
const file = event.target.files[0];
this.apiService.uploadFile('/upload', file, { patientId: 1 }).subscribe({
  next: (response) => console.log('Arquivo enviado:', response)
});
```

## Autenticação

O `authInterceptor` adiciona automaticamente o token de autenticação em todas as requisições (exceto login e register).

O token é armazenado no `localStorage` e gerenciado pelo `AuthService`:

```typescript
// Login (o token é salvo automaticamente)
this.authService.login(email, senha).subscribe({
  next: (success) => {
    if (success) {
      // Token já foi salvo automaticamente
      console.log('Token:', this.authService.getToken());
    }
  }
});

// Verificar se está autenticado
if (this.authService.isAuthenticated()) {
  console.log('Usuário autenticado');
}

// Logout (remove token e dados do usuário)
this.authService.logout();
```

## Tratamento de Erros

O `errorInterceptor` trata automaticamente erros comuns:

- **401 (Não Autorizado)**: Redireciona para login e limpa a sessão
- **403 (Proibido)**: Mostra mensagem de permissão negada
- **404 (Não Encontrado)**: Mostra mensagem de recurso não encontrado
- **500 (Erro do Servidor)**: Mostra mensagem de erro interno
- **0 (CORS/Conectividade)**: Mostra mensagem de conexão

Você também pode tratar erros manualmente:

```typescript
this.apiService.get('/users').subscribe({
  next: (users) => {
    // Sucesso
  },
  error: (error: ApiError) => {
    console.error('Status:', error.status);
    console.error('Mensagem:', error.message);
    console.error('Erro completo:', error.error);
  }
});
```

## Exemplo Completo em um Componente

```typescript
import { Component, OnInit } from '@angular/core';
import { ApiService, ApiError } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html'
})
export class ExampleComponent implements OnInit {
  users: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;

    this.apiService.get('/users').subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error: ApiError) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  createUser(userData: any) {
    this.apiService.post('/users', userData).subscribe({
      next: (newUser) => {
        console.log('Usuário criado:', newUser);
        this.loadUsers(); // Recarrega a lista
      },
      error: (error: ApiError) => {
        console.error('Erro ao criar usuário:', error);
      }
    });
  }
}
```

## Endpoints Esperados

Baseado na estrutura do projeto, os seguintes endpoints devem estar disponíveis no backend:

- `POST /login` - Autenticação
- `POST /register` - Registro de usuário
- `GET /patients` - Listar pacientes
- `GET /patients/:id` - Buscar paciente por ID
- `GET /patients/search?q=termo` - Buscar pacientes
- `POST /patients` - Criar paciente
- `PUT /patients/:id` - Atualizar paciente
- `DELETE /patients/:id` - Deletar paciente

## Notas Importantes

1. **CORS**: O backend deve estar configurado para aceitar requisições do frontend
2. **Token JWT**: O token é adicionado automaticamente no header `Authorization: Bearer <token>`
3. **Headers**: Headers padrão (`Content-Type: application/json`) são adicionados automaticamente
4. **Erros**: Erros são tratados globalmente pelo `errorInterceptor`, mas você pode tratar localmente também

