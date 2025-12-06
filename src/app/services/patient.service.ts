import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Patient, PatientLegacy, patientToLegacy, legacyToPatient } from '../models/patient.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  // Dados locais como fallback (formato legacy para compatibilidade)
  private patientsLegacy: PatientLegacy[] = [
    {
      id: 1,
      nome: "João Silva",
      alergias: ["Amendoim"],
      doencas: ["Hipertensão"],
      medicamentos: ["Losartana"],
      contatoEmergencia: "Maria - (99) 99999-9999",
      tipoSanguineo: "O+",
      cirurgias: ["Apendicectomia (2015)"],
      internacoes: ["2020 - Crise hipertensiva"],
      exames: ["ECG - 2023 - Normal"]
    },
    {
      id: 2,
      nome: "Maria Santos",
      alergias: ["Penicilina", "Iodo"],
      doencas: ["Diabetes Tipo 2"],
      medicamentos: ["Metformina", "Insulina"],
      contatoEmergencia: "Carlos - (11) 98888-8888",
      tipoSanguineo: "A+",
      cirurgias: ["Colecistectomia (2018)"],
      internacoes: ["2021 - Controle glicêmico"],
      exames: ["Hemoglobina glicada - 2024 - 7.2%"]
    },
    {
      id: 3,
      nome: "Pedro Oliveira",
      alergias: ["Látex"],
      doencas: ["Asma"],
      medicamentos: ["Salbutamol", "Budesonida"],
      contatoEmergencia: "Ana - (11) 97777-7777",
      tipoSanguineo: "B+",
      cirurgias: [],
      internacoes: ["2019 - Crise asmática"],
      exames: ["Espirometria - 2023 - Normal"]
    },
    {
      id: 4,
      nome: "Ana Costa",
      alergias: ["Dipirona"],
      doencas: ["Artrite Reumatoide"],
      medicamentos: ["Metotrexato", "Ácido fólico"],
      contatoEmergencia: "Roberto - (11) 96666-6666",
      tipoSanguineo: "AB+",
      cirurgias: ["Artroscopia joelho (2020)"],
      internacoes: [],
      exames: ["Fator reumatoide - 2024 - Positivo"]
    },
    {
      id: 5,
      nome: "Carlos Ferreira",
      alergias: ["Sulfa"],
      doencas: ["Hipertensão", "Dislipidemia"],
      medicamentos: ["Amlodipina", "Atorvastatina"],
      contatoEmergencia: "Julia - (11) 95555-5555",
      tipoSanguineo: "O-",
      cirurgias: ["Bypass coronário (2017)"],
      internacoes: ["2017 - Infarto agudo do miocárdio"],
      exames: ["Ecocardiograma - 2024 - Normal"]
    }
  ];

  constructor(private apiService: ApiService) {}

  /**
   * Busca um paciente por ID via API - informações completas
   * @param id - ID do paciente
   * @returns Observable<Patient | undefined>
   */
  getPatientById(id: number): Observable<Patient | undefined> {
    return this.apiService.get<Patient>(`/paciente/${id}`).pipe(
      map(patient => {
        return patient;
      }),
      catchError(error => {
        console.error('Erro ao buscar paciente:', error);
        // Fallback para dados locais (converte para formato novo)
        const legacyPatient = this.patientsLegacy.find(p => p.id === id);
        return of(legacyPatient ? legacyToPatient(legacyPatient) : undefined);
      })
    );
  }

  /**
   * Busca um paciente por ID com informações privadas (requer autenticação)
   * @param id - ID do paciente
   * @returns Observable<Patient | undefined>
   */
  getPatientPrivado(id: number): Observable<Patient | undefined> {
    return this.apiService.get<Patient>(`/paciente/${id}/privado`).pipe(
      map(patient => {
        return patient;
      }),
      catchError(error => {
        console.error('Erro ao buscar paciente privado:', error);
        // Fallback para informações básicas
        return this.getPatientById(id);
      })
    );
  }

  /**
   * Busca um paciente por ID com informações completas (requer autenticação)
   * @param id - ID do paciente
   * @returns Observable<Patient | undefined>
   * @deprecated Use getPatientPrivado() para informações privadas
   */
  getPatientCompleto(id: number): Observable<Patient | undefined> {
    return this.getPatientPrivado(id);
  }

  /**
   * Busca um paciente por ID e retorna no formato legacy (compatibilidade)
   * @param id - ID do paciente
   * @returns Observable<PatientLegacy | undefined>
   */
  getPatientByIdLegacy(id: number): Observable<PatientLegacy | undefined> {
    return this.getPatientById(id).pipe(
      map(patient => patient ? patientToLegacy(patient) : undefined)
    );
  }

  /**
   * Busca um paciente completo por ID e retorna no formato legacy (compatibilidade)
   * @param id - ID do paciente
   * @returns Observable<PatientLegacy | undefined>
   */
  getPatientCompletoLegacy(id: number): Observable<PatientLegacy | undefined> {
    return this.getPatientCompleto(id).pipe(
      map(patient => patient ? patientToLegacy(patient) : undefined)
    );
  }

  /**
   * Busca um paciente por ID de forma síncrona (compatibilidade - formato legacy)
   * @param id - ID do paciente
   * @returns PatientLegacy | undefined
   */
  getPatientByIdSync(id: number): PatientLegacy | undefined {
    return this.patientsLegacy.find(patient => patient.id === id);
  }

  /**
   * Busca pacientes via API com filtros opcionais
   * @param id - ID do paciente (opcional)
   * @param nome - Nome do paciente para busca parcial (opcional)
   * @returns Observable<Patient[]>
   */
  getAllPatients(id?: number, nome?: string): Observable<Patient[]> {
    const params: any = {};
    if (id !== undefined) params.id = id;
    if (nome) params.nome = nome;

    return this.apiService.get<Patient[]>('/pacientes', params).pipe(
      map(patients => {
        return patients;
      }),
      catchError(error => {
        console.error('Erro ao buscar pacientes:', error);
        // Fallback para dados locais (converte para formato novo)
        const patients = this.patientsLegacy.map(p => legacyToPatient(p));
        return of(patients);
      })
    );
  }

  /**
   * Busca todos os pacientes e retorna no formato legacy (compatibilidade)
   * @returns Observable<PatientLegacy[]>
   */
  getAllPatientsLegacy(): Observable<PatientLegacy[]> {
    return this.getAllPatients().pipe(
      map(patients => patients.map(p => patientToLegacy(p)))
    );
  }

  /**
   * Busca todos os pacientes de forma síncrona (compatibilidade - formato legacy)
   * @returns PatientLegacy[]
   */
  getAllPatientsSync(): PatientLegacy[] {
    return this.patientsLegacy;
  }

  /**
   * Busca pacientes por query via API (formato do backend)
   * Usa o parâmetro 'nome' do endpoint GET /pacientes para busca parcial
   * @param query - Termo de busca (nome do paciente)
   * @returns Observable<Patient[]>
   */
  searchPatients(query: string): Observable<Patient[]> {
    if (!query || query.trim() === '') {
      return of([]);
    }

    const searchTerm = query.trim();

    // Usa o parâmetro 'nome' do endpoint GET /pacientes para busca parcial (ilike)
    return this.apiService.get<Patient[]>('/pacientes', { nome: searchTerm }).pipe(
      map(patients => {
        return patients;
      }),
      catchError(error => {
        console.error('Erro ao buscar pacientes do backend:', error);
        // Fallback final: busca local (converte para formato novo)
        const legacyResults = this.searchPatientsSync(query);
        const converted = legacyResults.map(p => legacyToPatient(p));
        return of(converted);
      })
    );
  }

  /**
   * Filtra pacientes localmente baseado no termo de busca
   * @param patients - Array de pacientes do backend
   * @param searchTerm - Termo de busca
   * @returns Array de pacientes filtrados
   */
  private filterPatientsLocal(patients: Patient[], searchTerm: string): Patient[] {
    const term = searchTerm.toLowerCase().trim();
    
    return patients.filter(patient => {
      // Busca por nome
      if (patient.nome.toLowerCase().includes(term)) {
        return true;
      }
      
      // Busca por alergias
      if (patient.alergias?.some(alergia => alergia.toLowerCase().includes(term))) {
        return true;
      }
      
      // Busca por doenças crônicas
      if (patient.doencas_cronicas?.some(doenca => doenca.toLowerCase().includes(term))) {
        return true;
      }
      
      // Busca por medicamentos contínuos
      if (patient.medicamentos_continuos?.some(med => med.toLowerCase().includes(term))) {
        return true;
      }
      
      // Busca por contatos de emergência
      if (patient.contatos_emergencia?.some(contato => 
        contato.nome.toLowerCase().includes(term) || 
        contato.telefone.includes(term)
      )) {
        return true;
      }
      
      // Busca por tipo sanguíneo
      if (patient.informacoes_privadas?.tipo_sanguineo?.toLowerCase().includes(term)) {
        return true;
      }
      
      // Busca por cirurgias
      if (patient.informacoes_privadas?.cirurgias?.some(cirurgia => 
        cirurgia.toLowerCase().includes(term)
      )) {
        return true;
      }
      
      // Busca por internações
      if (patient.informacoes_privadas?.internacoes_passadas?.some(internacao => 
        internacao.toLowerCase().includes(term)
      )) {
        return true;
      }
      
      // Busca por exames
      const allExames = [
        ...(patient.informacoes_privadas?.alteracoes_exames || []),
        ...(patient.informacoes_privadas?.historico_exames || [])
      ];
      if (allExames.some(exame => exame.toLowerCase().includes(term))) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Busca pacientes por query e retorna no formato legacy (compatibilidade)
   * @param query - Termo de busca
   * @returns Observable<PatientLegacy[]>
   */
  searchPatientsLegacy(query: string): Observable<PatientLegacy[]> {
    return this.searchPatients(query).pipe(
      map(patients => patients.map(p => patientToLegacy(p)))
    );
  }

  /**
   * Busca pacientes por query de forma síncrona (compatibilidade - formato legacy)
   * Busca melhorada para incluir mais campos
   * @param query - Termo de busca
   * @returns PatientLegacy[]
   */
  searchPatientsSync(query: string): PatientLegacy[] {
    if (!query || query.trim() === '') {
      return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    return this.patientsLegacy.filter(patient => {
      // Busca por nome
      if (patient.nome.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Busca por tipo sanguíneo
      if (patient.tipoSanguineo.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Busca por alergias
      if (patient.alergias.some(alergia => alergia.toLowerCase().includes(searchTerm))) {
        return true;
      }
      
      // Busca por doenças
      if (patient.doencas.some(doenca => doenca.toLowerCase().includes(searchTerm))) {
        return true;
      }
      
      // Busca por medicamentos
      if (patient.medicamentos.some(med => med.toLowerCase().includes(searchTerm))) {
        return true;
      }
      
      // Busca por contato de emergência
      if (patient.contatoEmergencia.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Busca por cirurgias
      if (patient.cirurgias.some(cirurgia => cirurgia.toLowerCase().includes(searchTerm))) {
        return true;
      }
      
      // Busca por internações
      if (patient.internacoes.some(internacao => internacao.toLowerCase().includes(searchTerm))) {
        return true;
      }
      
      // Busca por exames
      if (patient.exames.some(exame => exame.toLowerCase().includes(searchTerm))) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Cria um novo paciente via API
   * @param patient - Dados do paciente (PacienteCompleto)
   * @returns Observable<Patient>
   */
  createPatient(patient: Omit<Patient, 'id'>): Observable<Patient> {
    return this.apiService.post<Patient>('/paciente', patient);
  }

  /**
   * Atualiza parcialmente um paciente via API
   * @param id - ID do paciente
   * @param patient - Dados atualizados do paciente (apenas campos a atualizar)
   * @returns Observable<Patient>
   */
  updatePatient(id: number, patient: Partial<Patient>): Observable<Patient> {
    return this.apiService.patch<Patient>(`/paciente/${id}`, patient);
  }

  /**
   * Deleta um paciente via API
   * @param id - ID do paciente
   * @returns Observable<void>
   */
  deletePatient(id: number): Observable<void> {
    return this.apiService.delete<void>(`/paciente/${id}`);
  }

  /**
   * Ativa/inativa um paciente via API
   * @param id - ID do paciente
   * @param ativo - Status ativo/inativo
   * @returns Observable<Patient>
   */
  updatePatientStatus(id: number, ativo: boolean): Observable<Patient> {
    // Nota: A documentação especifica /paciente/{id}/status (singular), não /pacientes/{id}/status
    return this.apiService.patch<Patient>(`/paciente/${id}/status`, { ativo });
  }
}
