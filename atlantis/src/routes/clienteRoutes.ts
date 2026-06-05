import { Router } from 'express';
import * as ClienteController from '../controllers/clienteController';

const router = Router();

router.get('/', ClienteController.listar);
router.get('/:id', ClienteController.buscarPorId);
router.post('/', ClienteController.criar);
router.put('/:id', ClienteController.atualizar);
router.delete('/:id', ClienteController.deletar);

router.post('/:id/documentos', ClienteController.adicionarDocumento);
router.delete('/:id/documentos/:docId', ClienteController.removerDocumento);

router.post('/:id/telefones', ClienteController.adicionarTelefone);
router.delete('/:id/telefones/:telId', ClienteController.removerTelefone);

export default router;
