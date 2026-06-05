import { Request, Response } from 'express';
import * as ClienteModel from '../models/clienteModel';

export async function listar(req: Request, res: Response): Promise<void> {
  try {
    const clientes = await ClienteModel.listarClientes();
    res.json({ sucesso: true, dados: clientes });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar clientes', erro: String(err) });
  }
}

export async function buscarPorId(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const cliente = await ClienteModel.buscarClientePorId(id);
    if (!cliente) { res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' }); return; }

    const documentos = await ClienteModel.listarDocumentos(id);
    const telefones = await ClienteModel.listarTelefones(id);

    res.json({ sucesso: true, dados: { ...cliente, documentos, telefones } });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar cliente', erro: String(err) });
  }
}

export async function criar(req: Request, res: Response): Promise<void> {
  try {
    const { nome, email, tipo, titular_id, data_nascimento } = req.body;
    if (!nome || !tipo) { res.status(400).json({ sucesso: false, mensagem: 'Nome e tipo são obrigatórios' }); return; }

    const id = await ClienteModel.criarCliente({ nome, email, tipo, titular_id, data_nascimento });
    res.status(201).json({ sucesso: true, mensagem: 'Cliente cadastrado com sucesso', id });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar cliente', erro: String(err) });
  }
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const ok = await ClienteModel.atualizarCliente(id, req.body);
    if (!ok) { res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' }); return; }
    res.json({ sucesso: true, mensagem: 'Cliente atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar cliente', erro: String(err) });
  }
}

export async function deletar(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const ok = await ClienteModel.deletarCliente(id);
    if (!ok) { res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' }); return; }
    res.json({ sucesso: true, mensagem: 'Cliente removido com sucesso' });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao remover cliente', erro: String(err) });
  }
}

export async function adicionarDocumento(req: Request, res: Response): Promise<void> {
  try {
    const cliente_id = Number(req.params.id);
    const { tipo, numero } = req.body;
    if (!tipo || !numero) { res.status(400).json({ sucesso: false, mensagem: 'Tipo e número são obrigatórios' }); return; }

    const id = await ClienteModel.adicionarDocumento({ cliente_id, tipo, numero });
    res.status(201).json({ sucesso: true, mensagem: 'Documento adicionado', id });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao adicionar documento', erro: String(err) });
  }
}

export async function removerDocumento(req: Request, res: Response): Promise<void> {
  try {
    const ok = await ClienteModel.deletarDocumento(Number(req.params.docId));
    if (!ok) { res.status(404).json({ sucesso: false, mensagem: 'Documento não encontrado' }); return; }
    res.json({ sucesso: true, mensagem: 'Documento removido' });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao remover documento', erro: String(err) });
  }
}

export async function adicionarTelefone(req: Request, res: Response): Promise<void> {
  try {
    const cliente_id = Number(req.params.id);
    const { numero, tipo } = req.body;
    if (!numero) { res.status(400).json({ sucesso: false, mensagem: 'Número é obrigatório' }); return; }

    const id = await ClienteModel.adicionarTelefone({ cliente_id, numero, tipo: tipo || 'celular' });
    res.status(201).json({ sucesso: true, mensagem: 'Telefone adicionado', id });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao adicionar telefone', erro: String(err) });
  }
}

export async function removerTelefone(req: Request, res: Response): Promise<void> {
  try {
    const ok = await ClienteModel.deletarTelefone(Number(req.params.telId));
    if (!ok) { res.status(404).json({ sucesso: false, mensagem: 'Telefone não encontrado' }); return; }
    res.json({ sucesso: true, mensagem: 'Telefone removido' });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao remover telefone', erro: String(err) });
  }
}
