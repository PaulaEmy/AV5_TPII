import * as ClienteModel from '../models/clienteModel';
import {
  CriarClienteDTO,
  AtualizarClienteDTO,
  AdicionarDocumentoDTO,
  AdicionarTelefoneDTO,
  ClienteResponseDTO,
  ClienteDetalheResponseDTO,
  DocumentoResponseDTO,
  TelefoneResponseDTO,
} from '../dto/ClienteDTO';

export class ClienteService {
  async listarTodos(): Promise<ClienteResponseDTO[]> {
    const clientes = await ClienteModel.listarClientes();
    return clientes.map(c => this.toClienteDTO(c));
  }

  async buscarPorId(id: number): Promise<ClienteDetalheResponseDTO> {
    const cliente = await ClienteModel.buscarClientePorId(id);
    if (!cliente) throw new Error('Cliente não encontrado');

    const documentos = await ClienteModel.listarDocumentos(id);
    const telefones  = await ClienteModel.listarTelefones(id);

    return {
      ...this.toClienteDTO(cliente),
      documentos: documentos.map(d => this.toDocumentoDTO(d)),
      telefones:  telefones.map(t => this.toTelefoneDTO(t)),
    };
  }

  async criar(dto: CriarClienteDTO): Promise<{ id: number }> {
    if (!dto.nome?.trim()) throw new Error('Nome é obrigatório');
    if (!dto.tipo)         throw new Error('Tipo é obrigatório');

    if (dto.tipo === 'dependente') {
      if (!dto.titular_id) throw new Error('Dependente precisa de um titular');
      const titular = await ClienteModel.buscarClientePorId(dto.titular_id);
      if (!titular)        throw new Error('Titular não encontrado');
      if (titular.tipo === 'dependente') throw new Error('Um dependente não pode ser titular de outro dependente');
    }

    const id = await ClienteModel.criarCliente(dto);
    return { id };
  }

  async atualizar(id: number, dto: AtualizarClienteDTO): Promise<void> {
    const existe = await ClienteModel.buscarClientePorId(id);
    if (!existe) throw new Error('Cliente não encontrado');

    const ok = await ClienteModel.atualizarCliente(id, dto);
    if (!ok)   throw new Error('Falha ao atualizar cliente');
  }

  async deletar(id: number): Promise<void> {
    const existe = await ClienteModel.buscarClientePorId(id);
    if (!existe) throw new Error('Cliente não encontrado');

    const ok = await ClienteModel.deletarCliente(id);
    if (!ok)   throw new Error('Falha ao excluir cliente');
  }

  async adicionarDocumento(clienteId: number, dto: AdicionarDocumentoDTO): Promise<{ id: number }> {
    const cliente = await ClienteModel.buscarClientePorId(clienteId);
    if (!cliente) throw new Error('Cliente não encontrado');

    if (!dto.tipo || !dto.numero?.trim()) throw new Error('Tipo e número são obrigatórios');

    const id = await ClienteModel.adicionarDocumento({ cliente_id: clienteId, ...dto });
    return { id };
  }

  async removerDocumento(clienteId: number, docId: number): Promise<void> {
    const ok = await ClienteModel.deletarDocumento(docId);
    if (!ok) throw new Error('Documento não encontrado');
  }

  async adicionarTelefone(clienteId: number, dto: AdicionarTelefoneDTO): Promise<{ id: number }> {
    const cliente = await ClienteModel.buscarClientePorId(clienteId);
    if (!cliente) throw new Error('Cliente não encontrado');

    if (!dto.numero?.trim()) throw new Error('Número é obrigatório');

    const id = await ClienteModel.adicionarTelefone({ cliente_id: clienteId, ...dto });
    return { id };
  }

  async removerTelefone(clienteId: number, telId: number): Promise<void> {
    const ok = await ClienteModel.deletarTelefone(telId);
    if (!ok) throw new Error('Telefone não encontrado');
  }

  private toClienteDTO(c: any): ClienteResponseDTO {
    return {
      id:              c.id,
      nome:            c.nome,
      email:           c.email ?? null,
      tipo:            c.tipo,
      titular_id:      c.titular_id ?? null,
      nome_titular:    c.nome_titular,
      data_nascimento: c.data_nascimento ?? null,
      criado_em:       c.criado_em,
    };
  }

  private toDocumentoDTO(d: any): DocumentoResponseDTO {
    return { id: d.id, tipo: d.tipo, numero: d.numero };
  }

  private toTelefoneDTO(t: any): TelefoneResponseDTO {
    return { id: t.id, numero: t.numero, tipo: t.tipo };
  }
}