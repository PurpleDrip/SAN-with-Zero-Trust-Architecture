import { Router } from 'express';
import { TrustController } from '../controllers/trustController';

export const createTrustRouter = (controller: TrustController) => {
    const router = Router();
    
    router.post('/calculate', controller.calculateTrust);
    router.post('/simulate-attack', controller.simulateAttack);
    router.post('/monitor', controller.monitorBehavior);
    router.get('/anomalies/:nodeId', controller.detectAnomalies);
    router.post('/block', controller.blockNode);
    router.post('/unblock', controller.unblockNode);
    
    return router;
};
