/**
 * Modelo de Contato de Emergência (corresponde ao backend)
 */
export interface ContatoEmergencia {
  nome: string;
  telefone: string;
}

/**
 * Modelo base de informações privadas (corresponde ao backend)
 */
export interface InformacoesPrivadas {
  tipo_sanguineo?: string;
  cirurgias?: string[];
  internacoes_passadas?: string[];
  alteracoes_exames?: string[];
  historico_exames?: string[];
}

/**
 * Modelo completo de Paciente (corresponde ao backend PacienteCompleto)
 */
export interface Patient {
  id?: number;
  nome: string;
  alergias?: string[];
  doencas_cronicas?: string[];  // Backend usa snake_case
  medicamentos_continuos?: string[];  // Backend usa snake_case
  contatos_emergencia?: ContatoEmergencia[];  // Backend usa array de objetos
  informacoes_privadas?: InformacoesPrivadas;
  created_at?: string;  // ISO datetime string
}

/**
 * Interface de compatibilidade para código existente
 * Mantém os campos antigos para não quebrar componentes
 */
export interface PatientLegacy {
  id: number;
  nome: string;
  alergias: string[];
  doencas: string[];  // Mapeia de doencas_cronicas
  medicamentos: string[];  // Mapeia de medicamentos_continuos
  contatoEmergencia: string;  // Mapeia de contatos_emergencia
  tipoSanguineo: string;  // Mapeia de informacoes_privadas.tipo_sanguineo
  cirurgias: string[];  // Mapeia de informacoes_privadas.cirurgias
  internacoes: string[];  // Mapeia de informacoes_privadas.internacoes_passadas
  exames: string[];  // Mapeia de informacoes_privadas.alteracoes_exames ou historico_exames
}

/**
 * Função helper para converter Patient (backend) para PatientLegacy (frontend)
 */
export function patientToLegacy(patient: Patient): PatientLegacy {
  // Formata contatos de emergência como string
  const contatoEmergencia = patient.contatos_emergencia && patient.contatos_emergencia.length > 0
    ? patient.contatos_emergencia.map(c => `${c.nome} - ${c.telefone}`).join(', ')
    : '';

  // Combina alteracoes_exames e historico_exames
  const exames = [
    ...(patient.informacoes_privadas?.alteracoes_exames || []),
    ...(patient.informacoes_privadas?.historico_exames || [])
  ];

  return {
    id: patient.id || 0,
    nome: patient.nome,
    alergias: patient.alergias || [],
    doencas: patient.doencas_cronicas || [],
    medicamentos: patient.medicamentos_continuos || [],
    contatoEmergencia: contatoEmergencia,
    tipoSanguineo: patient.informacoes_privadas?.tipo_sanguineo || '',
    cirurgias: patient.informacoes_privadas?.cirurgias || [],
    internacoes: patient.informacoes_privadas?.internacoes_passadas || [],
    exames: exames
  };
}

/**
 * Função helper para converter PatientLegacy (frontend) para Patient (backend)
 */
export function legacyToPatient(legacy: PatientLegacy): Patient {
  // Parse contato de emergência (formato: "Nome - Telefone")
  const contatos: ContatoEmergencia[] = [];
  if (legacy.contatoEmergencia) {
    const parts = legacy.contatoEmergencia.split(' - ');
    if (parts.length >= 2) {
      contatos.push({
        nome: parts[0],
        telefone: parts.slice(1).join(' - ')
      });
    }
  }

  return {
    id: legacy.id,
    nome: legacy.nome,
    alergias: legacy.alergias,
    doencas_cronicas: legacy.doencas,
    medicamentos_continuos: legacy.medicamentos,
    contatos_emergencia: contatos.length > 0 ? contatos : undefined,
    informacoes_privadas: {
      tipo_sanguineo: legacy.tipoSanguineo || undefined,
      cirurgias: legacy.cirurgias.length > 0 ? legacy.cirurgias : undefined,
      internacoes_passadas: legacy.internacoes.length > 0 ? legacy.internacoes : undefined,
      alteracoes_exames: legacy.exames.length > 0 ? legacy.exames : undefined
    }
  };
}
