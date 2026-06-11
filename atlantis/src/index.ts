import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { testConnection } from './database/connection';
import clienteRoutes from './routes/clienteRoutes';
import hospedagemRoutes from './routes/hospedagemRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/clientes', clienteRoutes);
app.use('/api/hospedagens', hospedagemRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', sistema: 'Atlantis Hotel' }));

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

async function main() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Sistema rodando em http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});

// ૮₍ ´˶• ᴥ •˶` ₎ა shoyu~