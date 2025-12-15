import { Router } from 'express';
import { NodeController } from '../controllers/nodeController';

export const createNodeRouter = (controller: NodeController) => {
    const router = Router();
    
    router.get('/', controller.getNodes);
    router.post('/', controller.createNode);
    router.get('/:id', controller.getNode);
    router.delete('/:id', controller.deleteNode);
    
    return router;
};
