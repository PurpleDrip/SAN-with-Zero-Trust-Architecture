import { Router } from 'express';
import { TrustController } from '../controllers/trustController';

export const createTrustRouter = (controller: TrustController) => {
    const router = Router();
    router.post('/simulate-attack', controller.simulateAttack);
    return router;
};