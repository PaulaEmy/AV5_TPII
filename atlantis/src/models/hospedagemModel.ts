import pool from '../database/connection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface Acomodacao extends RowDataPacket {
  id: number;
  nome: string;
  camas_solteiro: number;
  camas_casal: number;
  suites: number;
  climatizacao: boolean;
  garagem: number;
  preco_diaria: number;
}

export interface Quarto extends RowDataPacket {
  id: number;
  numero: string;
  acomodacao_id: number;
  disponivel: boolean;
  observacao: string | null;
  nome_acomodacao?: string;
  camas_solteiro?: number;
  camas_casal?: number;
  suites?: number;
  climatizacao?: boolean;
  garagem?: number;
  preco_diaria?: number;
}

export interface Hospedagem extends RowDataPacket {
  id: number;
  cliente_id: number;
  quarto_id: number;
  data_checkin: string;
  data_checkout: string | null;
  status: 'ativa' | 'finalizada' | 'cancelada';
  valor_total: number | null;
  observacoes: string | null;
  criado_em: string;
  nome_cliente?: string;
  numero_quarto?: string;
  nome_acomodacao?: string;
  preco_diaria?: number;
}

export async function listarAcomodacoes(): Promise<Acomodacao[]> {
  const [rows] = await pool.query<Acomodacao[]>(
    'SELECT * FROM acomodacoes ORDER BY nome'
  );
  return rows;
}

export async function listarQuartos(apenasDisponiveis = false): Promise<Quarto[]> {
  const where = apenasDisponiveis ? 'WHERE q.disponivel = TRUE' : '';
  const [rows] = await pool.query<Quarto[]>(
    `SELECT q.*, a.nome AS nome_acomodacao,
            a.camas_solteiro, a.camas_casal, a.suites,
            a.climatizacao, a.garagem, a.preco_diaria
     FROM quartos q
     JOIN acomodacoes a ON q.acomodacao_id = a.id
     ${where}
     ORDER BY q.numero`
  );
  return rows;
}

export async function buscarQuartoPorId(id: number): Promise<Quarto | null> {
  const [rows] = await pool.query<Quarto[]>(
    `SELECT q.*, a.nome AS nome_acomodacao,
            a.camas_solteiro, a.camas_casal, a.suites,
            a.climatizacao, a.garagem, a.preco_diaria
     FROM quartos q
     JOIN acomodacoes a ON q.acomodacao_id = a.id
     WHERE q.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function listarHospedagens(): Promise<Hospedagem[]> {
  const [rows] = await pool.query<Hospedagem[]>(
    `SELECT h.*,
            c.nome   AS nome_cliente,
            q.numero AS numero_quarto,
            a.nome   AS nome_acomodacao,
            a.preco_diaria
     FROM hospedagens h
     JOIN clientes    c ON h.cliente_id = c.id
     JOIN quartos     q ON h.quarto_id  = q.id
     JOIN acomodacoes a ON q.acomodacao_id = a.id
     ORDER BY h.criado_em DESC`
  );
  return rows;
}

export async function buscarHospedagemPorId(id: number): Promise<Hospedagem | null> {
  const [rows] = await pool.query<Hospedagem[]>(
    `SELECT h.*,
            c.nome   AS nome_cliente,
            q.numero AS numero_quarto,
            a.nome   AS nome_acomodacao,
            a.preco_diaria
     FROM hospedagens h
     JOIN clientes    c ON h.cliente_id = c.id
     JOIN quartos     q ON h.quarto_id  = q.id
     JOIN acomodacoes a ON q.acomodacao_id = a.id
     WHERE h.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function criarHospedagem(dados: {
  cliente_id: number;
  quarto_id: number;
  data_checkin: string;
  observacoes?: string;
}): Promise<number> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO hospedagens (cliente_id, quarto_id, data_checkin, observacoes, status)
       VALUES (?, ?, ?, ?, 'ativa')`,
      [dados.cliente_id, dados.quarto_id, dados.data_checkin, dados.observacoes || null]
    );

    await conn.query(
      'UPDATE quartos SET disponivel = FALSE WHERE id = ?',
      [dados.quarto_id]
    );

    await conn.commit();
    return result.insertId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function finalizarHospedagem(id: number, dataCheckout: string): Promise<boolean> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query<Hospedagem[]>(
      `SELECT h.data_checkin, h.quarto_id, a.preco_diaria
       FROM hospedagens h
       JOIN quartos q ON h.quarto_id = q.id
       JOIN acomodacoes a ON q.acomodacao_id = a.id
       WHERE h.id = ?`,
      [id]
    );
    if (!rows[0]) { await conn.rollback(); return false; }

    const checkin  = new Date(rows[0].data_checkin);
    const checkout = new Date(dataCheckout);
    const dias  = Math.max(1, Math.ceil((checkout.getTime() - checkin.getTime()) / 86400000));
    const valor = dias * Number(rows[0].preco_diaria);

    await conn.query(
      `UPDATE hospedagens
       SET data_checkout = ?, status = 'finalizada', valor_total = ?
       WHERE id = ?`,
      [dataCheckout, valor, id]
    );

    await conn.query(
      'UPDATE quartos SET disponivel = TRUE WHERE id = ?',
      [rows[0].quarto_id]
    );

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function cancelarHospedagem(id: number): Promise<boolean> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query<Hospedagem[]>(
      'SELECT quarto_id FROM hospedagens WHERE id = ? AND status = "ativa"', [id]
    );
    if (!rows[0]) { await conn.rollback(); return false; }

    await conn.query(`UPDATE hospedagens SET status = 'cancelada' WHERE id = ?`, [id]);
    await conn.query('UPDATE quartos SET disponivel = TRUE WHERE id = ?', [rows[0].quarto_id]);

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function obterEstatisticas(): Promise<{
  totalClientes: number;
  quartosOcupados: number;
  quartosDisponiveis: number;
  hospedagensAtivas: number;
  receitaTotal: number;
}> {
  const [[{ totalClientes }]]      = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS totalClientes FROM clientes WHERE tipo = "titular"');
  const [[{ quartosOcupados }]]    = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS quartosOcupados FROM quartos WHERE disponivel = FALSE');
  const [[{ quartosDisponiveis }]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS quartosDisponiveis FROM quartos WHERE disponivel = TRUE');
  const [[{ hospedagensAtivas }]]  = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS hospedagensAtivas FROM hospedagens WHERE status = "ativa"');
  const [[{ receitaTotal }]]       = await pool.query<RowDataPacket[]>('SELECT COALESCE(SUM(valor_total), 0) AS receitaTotal FROM hospedagens WHERE status = "finalizada"');

  return {
    totalClientes:      Number(totalClientes),
    quartosOcupados:    Number(quartosOcupados),
    quartosDisponiveis: Number(quartosDisponiveis),
    hospedagensAtivas:  Number(hospedagensAtivas),
    receitaTotal:       Number(receitaTotal),
  };
}
