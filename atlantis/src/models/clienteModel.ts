import pool from '../database/connection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface Cliente extends RowDataPacket {
  id: number;
  nome: string;
  email: string | null;
  tipo: 'titular' | 'dependente';
  titular_id: number | null;
  data_nascimento: string | null;
  criado_em: string;
}

export interface Documento extends RowDataPacket {
  id: number;
  cliente_id: number;
  tipo: 'CPF' | 'RG' | 'CNH' | 'Passaporte' | 'Outro';
  numero: string;
}

export interface Telefone extends RowDataPacket {
  id: number;
  cliente_id: number;
  numero: string;
  tipo: 'celular' | 'residencial' | 'comercial';
}

export async function listarClientes(): Promise<Cliente[]> {
  const [rows] = await pool.query<Cliente[]>(
    `SELECT c.*, t.nome AS nome_titular
     FROM clientes c
     LEFT JOIN clientes t ON c.titular_id = t.id
     ORDER BY c.tipo, c.nome`
  );
  return rows;
}

export async function buscarClientePorId(id: number): Promise<Cliente | null> {
  const [rows] = await pool.query<Cliente[]>(
    'SELECT * FROM clientes WHERE id = ?', [id]
  );
  return rows[0] || null;
}

export async function criarCliente(dados: {
  nome: string;
  email?: string;
  tipo: 'titular' | 'dependente';
  titular_id?: number;
  data_nascimento?: string;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO clientes (nome, email, tipo, titular_id, data_nascimento)
     VALUES (?, ?, ?, ?, ?)`,
    [dados.nome, dados.email || null, dados.tipo, dados.titular_id || null, dados.data_nascimento || null]
  );
  return result.insertId;
}

export async function atualizarCliente(id: number, dados: Partial<{
  nome: string;
  email: string;
  data_nascimento: string;
}>): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE clientes SET nome = ?, email = ?, data_nascimento = ? WHERE id = ?`,
    [dados.nome, dados.email || null, dados.data_nascimento || null, id]
  );
  return result.affectedRows > 0;
}

export async function deletarCliente(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM clientes WHERE id = ?', [id]
  );
  return result.affectedRows > 0;
}

export async function listarDocumentos(clienteId: number): Promise<Documento[]> {
  const [rows] = await pool.query<Documento[]>(
    'SELECT * FROM documentos WHERE cliente_id = ?', [clienteId]
  );
  return rows;
}

export async function adicionarDocumento(dados: {
  cliente_id: number;
  tipo: string;
  numero: string;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO documentos (cliente_id, tipo, numero) VALUES (?, ?, ?)',
    [dados.cliente_id, dados.tipo, dados.numero]
  );
  return result.insertId;
}

export async function deletarDocumento(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM documentos WHERE id = ?', [id]
  );
  return result.affectedRows > 0;
}

export async function listarTelefones(clienteId: number): Promise<Telefone[]> {
  const [rows] = await pool.query<Telefone[]>(
    'SELECT * FROM telefones WHERE cliente_id = ?', [clienteId]
  );
  return rows;
}

export async function adicionarTelefone(dados: {
  cliente_id: number;
  numero: string;
  tipo: string;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO telefones (cliente_id, numero, tipo) VALUES (?, ?, ?)',
    [dados.cliente_id, dados.numero, dados.tipo]
  );
  return result.insertId;
}

export async function deletarTelefone(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM telefones WHERE id = ?', [id]
  );
  return result.affectedRows > 0;
}
