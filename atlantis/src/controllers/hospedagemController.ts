import { Request, Response } from 'express';
import * as HospedagemModel from '../models/hospedagemModel';

export async function listarAcomodacoes(req: Request, res: Response): Promise<void> {
  try {
    const acomodacoes = await HospedagemModel.listarAcomodacoes();
    res.json({ sucesso: true, dados: acomodacoes });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar acomodações', erro: String(err) });
  }
}

export async function listarQuartos(req: Request, res: Response): Promise<void> {
  try {
    const apenasDisponiveis = req.query.disponivel === 'true';
    const quartos = await HospedagemModel.listarQuartos(apenasDisponiveis);
    res.json({ sucesso: true, dados: quartos });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar quartos', erro: String(err) });
  }
}

export async function listar(req: Request, res: Response): Promise<void> {
  try {
    const hospedagens = await HospedagemModel.listarHospedagens();
    res.json({ sucesso: true, dados: hospedagens });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar hospedagens', erro: String(err) });
  }
}

export async function buscarPorId(req: Request, res: Response): Promise<void> {
  try {
    const hospedagem = await HospedagemModel.buscarHospedagemPorId(Number(req.params.id));
    if (!hospedagem) { res.status(404).json({ sucesso: false, mensagem: 'Hospedagem não encontrada' }); return; }
    res.json({ sucesso: true, dados: hospedagem });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar hospedagem', erro: String(err) });
  }
}

export async function criar(req: Request, res: Response): Promise<void> {
  try {
    const { cliente_id, quarto_id, data_checkin, observacoes } = req.body;
    if (!cliente_id || !quarto_id || !data_checkin) {
      res.status(400).json({ sucesso: false, mensagem: 'cliente_id, quarto_id e data_checkin são obrigatórios' });
      return;
    }

    const quarto = await HospedagemModel.buscarQuartoPorId(Number(quarto_id));
    if (!quarto) { res.status(404).json({ sucesso: false, mensagem: 'Quarto não encontrado' }); return; }
    if (!quarto.disponivel) { res.status(409).json({ sucesso: false, mensagem: 'Quarto indisponível' }); return; }

    const id = await HospedagemModel.criarHospedagem({ cliente_id, quarto_id, data_checkin, observacoes });
    res.status(201).json({ sucesso: true, mensagem: 'Hospedagem iniciada com sucesso', id });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar hospedagem', erro: String(err) });
  }
}

export async function finalizar(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const { data_checkout } = req.body;
    if (!data_checkout) { res.status(400).json({ sucesso: false, mensagem: 'data_checkout é obrigatória' }); return; }

    const ok = await HospedagemModel.finalizarHospedagem(id, data_checkout);
    if (!ok) { res.status(404).json({ sucesso: false, mensagem: 'Hospedagem não encontrada' }); return; }
    res.json({ sucesso: true, mensagem: 'Check-out realizado com sucesso' });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao finalizar hospedagem', erro: String(err) });
  }
}

export async function cancelar(req: Request, res: Response): Promise<void> {
  try {
    const ok = await HospedagemModel.cancelarHospedagem(Number(req.params.id));
    if (!ok) { res.status(404).json({ sucesso: false, mensagem: 'Hospedagem não encontrada ou já encerrada' }); return; }
    res.json({ sucesso: true, mensagem: 'Hospedagem cancelada' });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao cancelar hospedagem', erro: String(err) });
  }
}

export async function dashboard(req: Request, res: Response): Promise<void> {
  try {
    const stats = await HospedagemModel.obterEstatisticas();
    res.json({ sucesso: true, dados: stats });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao obter estatísticas', erro: String(err) });
  }
}
