// src/app/models/vaga.model.ts
export interface Vaga {
  id: string;
  titulo: string;
  descricao: string;
  empresa?: string;
  local?: string;
  tipoContrato?: string;
  dataPublicacao: Date | string;
  bairro?: string; // Para filtro de localidade
  zonaDaCidade?: string; // Ex: "Zona Norte", "Centro"
  ehVagaVerde?: boolean; // Indica impacto sustentável
  aceitaRemoto?: boolean; // Indica redução de deslocamento
}
