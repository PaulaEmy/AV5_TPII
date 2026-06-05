import { Router } from 'express';
import * as HospedagemController from '../controllers/hospedagemController';

const router = Router();

router.get('/acomodacoes', HospedagemController.listarAcomodacoes);

router.get('/quartos', HospedagemController.listarQuartos);

router.get('/', HospedagemController.listar);
router.get('/dashboard', HospedagemController.dashboard);
router.get('/:id', HospedagemController.buscarPorId);
router.post('/', HospedagemController.criar);
router.patch('/:id/checkout', HospedagemController.finalizar);
router.patch('/:id/cancelar', HospedagemController.cancelar);

export default router;
