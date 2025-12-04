import { Request, Response } from 'express';
import { ITrustService } from '../services/trustServices';

export class TrustController {
    constructor(private trustService: ITrustService) {}

    // POST /api/trust/simulate-attack
    simulateAttack = (req: Request, res: Response) => {
        const { nodeId } = req.body;
        const updatedNode = this.trustService.simulateAttack(nodeId);
        
        if (updatedNode) {
            res.json({ message: "Attack Simulated! Node Blocked.", node: updatedNode });
        } else {
            res.status(404).json({ message: "Node not found" });
        }
    };
}