export interface Curso {
  id: string;
  nome: string;
  instituicao?: string;
  cargaHoraria?: string;
  modalidade?: string;
  dataInicio: Date | string;
  focadoEmSustentabilidade?: boolean;
  impactoComunitario?: string;
}
