export interface CriarHospedagemDTO {
  cliente_id: number;
  quarto_id: number;
  data_checkin: string;
  observacoes?: string;
}

export interface CheckoutDTO {
  data_checkout: string;
}

export interface AcomodacaoResponseDTO {
  id: number;
  nome: string;
  camas_solteiro: number;
  camas_casal: number;
  suites: number;
  climatizacao: boolean;
  garagem: number;
  preco_diaria: number;
}

export interface QuartoResponseDTO {
  id: number;
  numero: string;
  disponivel: boolean;
  observacao: string | null;
  acomodacao: AcomodacaoResponseDTO;
}

export interface HospedagemResponseDTO {
  id: number;
  cliente_id: number;
  nome_cliente: string;
  quarto_id: number;
  numero_quarto: string;
  nome_acomodacao: string;
  data_checkin: string;
  data_checkout: string | null;
  status: 'ativa' | 'finalizada' | 'cancelada';
  valor_total: number | null;
  observacoes: string | null;
  criado_em: string;
}

export interface DashboardResponseDTO {
  totalClientes: number;
  quartosOcupados: number;
  quartosDisponiveis: number;
  hospedagensAtivas: number;
  receitaTotal: number;
}