// src/app/models/vaga.model.ts
export interface Vaga {
  id: string;
  titulo: string;
  descricao: string;
  empresa?: string;
  local?: string;
  tipoContrato?: string;
  dataPublicacao: Date;
}
