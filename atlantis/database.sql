-- ============================================
-- SISTEMA ATLANTIS HOTEL - Script do Banco de Dados
-- ============================================

CREATE DATABASE IF NOT EXISTS atlantis_hotel
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE atlantis_hotel;

-- ============================================
-- TABELA: clientes
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE,
  tipo ENUM('titular', 'dependente') NOT NULL DEFAULT 'titular',
  titular_id INT NULL,
  data_nascimento DATE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_titular FOREIGN KEY (titular_id)
    REFERENCES clientes(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA: documentos
-- ============================================
CREATE TABLE IF NOT EXISTS documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  tipo ENUM('CPF', 'RG', 'CNH', 'Passaporte', 'Outro') NOT NULL,
  numero VARCHAR(50) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_doc_cliente FOREIGN KEY (cliente_id)
    REFERENCES clientes(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA: telefones
-- ============================================
CREATE TABLE IF NOT EXISTS telefones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  numero VARCHAR(20) NOT NULL,
  tipo ENUM('celular', 'residencial', 'comercial') NOT NULL DEFAULT 'celular',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tel_cliente FOREIGN KEY (cliente_id)
    REFERENCES clientes(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA: acomodacoes
-- ============================================
CREATE TABLE IF NOT EXISTS acomodacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  camas_solteiro INT NOT NULL DEFAULT 0,
  camas_casal INT NOT NULL DEFAULT 0,
  suites INT NOT NULL DEFAULT 0,
  climatizacao BOOLEAN NOT NULL DEFAULT TRUE,
  garagem INT NOT NULL DEFAULT 0,
  preco_diaria DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

-- ============================================
-- TABELA: quartos
-- ============================================
CREATE TABLE IF NOT EXISTS quartos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero VARCHAR(10) NOT NULL UNIQUE,
  acomodacao_id INT NOT NULL,
  disponivel BOOLEAN NOT NULL DEFAULT TRUE,
  observacao TEXT,
  CONSTRAINT fk_quarto_acomodacao FOREIGN KEY (acomodacao_id)
    REFERENCES acomodacoes(id)
);

-- ============================================
-- TABELA: hospedagens
-- ============================================
CREATE TABLE IF NOT EXISTS hospedagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  quarto_id INT NOT NULL,
  data_checkin DATE NOT NULL,
  data_checkout DATE,
  status ENUM('ativa', 'finalizada', 'cancelada') NOT NULL DEFAULT 'ativa',
  valor_total DECIMAL(10,2),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hosp_cliente FOREIGN KEY (cliente_id)
    REFERENCES clientes(id),
  CONSTRAINT fk_hosp_quarto FOREIGN KEY (quarto_id)
    REFERENCES quartos(id)
);

-- ============================================
-- DADOS INICIAIS - Tipos de acomodação
-- ============================================
INSERT INTO acomodacoes (nome, camas_solteiro, camas_casal, suites, climatizacao, garagem, preco_diaria) VALUES
  ('Casal Simples',    0, 1, 1, TRUE, 1, 250.00),
  ('Família Simples',  2, 1, 1, TRUE, 1, 350.00),
  ('Família Mais',     5, 1, 2, TRUE, 2, 550.00),
  ('Família Super',    6, 2, 3, TRUE, 2, 750.00),
  ('Solteiro Simples', 1, 0, 1, TRUE, 0, 180.00),
  ('Solteiro Mais',    0, 1, 1, TRUE, 1, 220.00)
ON DUPLICATE KEY UPDATE nome = nome;

-- ============================================
-- DADOS INICIAIS - Quartos
-- ============================================
INSERT INTO quartos (numero, acomodacao_id) VALUES
  ('101', (SELECT id FROM acomodacoes WHERE nome = 'Casal Simples')),
  ('102', (SELECT id FROM acomodacoes WHERE nome = 'Casal Simples')),
  ('201', (SELECT id FROM acomodacoes WHERE nome = 'Família Simples')),
  ('202', (SELECT id FROM acomodacoes WHERE nome = 'Família Mais')),
  ('203', (SELECT id FROM acomodacoes WHERE nome = 'Família Super')),
  ('301', (SELECT id FROM acomodacoes WHERE nome = 'Solteiro Simples')),
  ('302', (SELECT id FROM acomodacoes WHERE nome = 'Solteiro Mais')),
  ('303', (SELECT id FROM acomodacoes WHERE nome = 'Solteiro Mais'))
ON DUPLICATE KEY UPDATE numero = numero;
