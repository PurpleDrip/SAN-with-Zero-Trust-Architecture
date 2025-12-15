import { Request, Response } from 'express';
import { ITrustService } from '../services/trustServices';

export class TrustController {
    constructor(private trustService: ITrustService) {}

    // POST /api/trust/calculate
    calculateTrust = (req: Request, res: Response) => {
        const { nodeId } = req.body;
        const updatedNode = this.trustService.calculateTrust(nodeId);
        
        if (updatedNode) {
            res.json({ 
                message: "Trust score calculated", 
                node: updatedNode,
                trustBreakdown: updatedNode.trustBreakdown
            });
        } else {
            res.status(404).json({ message: "Node not found" });
        }
    };

    // POST /api/trust/simulate-attack
    simulateAttack = (req: Request, res: Response) => {
        const { nodeId } = req.body;
        const updatedNode = this.trustService.simulateAttack(nodeId);
        
        if (updatedNode) {
            res.json({ 
                message: "Attack Simulated! Node Blocked.", 
                node: updatedNode 
            });
        } else {
            res.status(404).json({ message: "Node not found" });
        }
    };

    // POST /api/trust/monitor
    monitorBehavior = (req: Request, res: Response) => {
        const { nodeId } = req.body;
        const updatedNode = this.trustService.monitorBehavior(nodeId);
        
        if (updatedNode) {
            res.json({ 
                message: "Behavior monitored", 
                node: updatedNode,
                suspiciousActivities: updatedNode.behaviorMetrics.suspiciousActivities
            });
        } else {
            res.status(404).json({ message: "Node not found" });
        }
    };

    // GET /api/trust/anomalies/:nodeId
    detectAnomalies = (req: Request, res: Response) => {
        const { nodeId } = req.params;
        const anomalies = this.trustService.detectAnomalies(nodeId);
        
        res.json({ 
            nodeId,
            anomalies,
            count: anomalies.length
        });
    };

    // POST /api/trust/block
    blockNode = (req: Request, res: Response) => {
        const { nodeId, reason } = req.body;
        const updatedNode = this.trustService.blockNode(nodeId, reason || 'Manual block');
        
        if (updatedNode) {
            res.json({ 
                message: "Node blocked", 
                node: updatedNode 
            });
        } else {
            res.status(404).json({ message: "Node not found" });
        }
    };

    // POST /api/trust/unblock
    unblockNode = (req: Request, res: Response) => {
        const { nodeId } = req.body;
        const updatedNode = this.trustService.unblockNode(nodeId);
        
        if (updatedNode) {
            res.json({ 
                message: "Node unblocked - re-verification required", 
                node: updatedNode 
            });
        } else {
            res.status(404).json({ message: "Node not found" });
        }
    };
}
