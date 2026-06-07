export interface CriarClienteDTO {
  nome: string;
  email?: string;
  tipo: 'titular' | 'dependente';
  titular_id?: number;
  data_nascimento?: string;
}

export interface AtualizarClienteDTO {
  nome?: string;
  email?: string;
  data_nascimento?: string;
}

export interface AdicionarDocumentoDTO {
  tipo: 'CPF' | 'RG' | 'CNH' | 'Passaporte' | 'Outro';
  numero: string;
}

export interface AdicionarTelefoneDTO {
  numero: string;
  tipo: 'celular' | 'residencial' | 'comercial';
}

export interface DocumentoResponseDTO {
  id: number;
  tipo: string;
  numero: string;
}

export interface TelefoneResponseDTO {
  id: number;
  numero: string;
  tipo: string;
}

export interface ClienteResponseDTO {
  id: number;
  nome: string;
  email: string | null;
  tipo: 'titular' | 'dependente';
  titular_id: number | null;
  nome_titular?: string;
  data_nascimento: string | null;
  criado_em: string;
}

export interface ClienteDetalheResponseDTO extends ClienteResponseDTO {
  documentos: DocumentoResponseDTO[];
  telefones: TelefoneResponseDTO[];
}