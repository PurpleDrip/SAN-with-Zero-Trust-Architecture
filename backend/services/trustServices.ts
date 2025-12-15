import { Node } from "../models/Node";

export interface ITrustService {
    calculateTrust(nodeId: string): Node | null;
    simulateAttack(nodeId: string): Node | null;
    monitorBehavior(nodeId: string): Node | null;
    detectAnomalies(nodeId: string): string[];
    updateTrustScore(nodeId: string): Node | null;
    blockNode(nodeId: string, reason: string): Node | null;
    unblockNode(nodeId: string): Node | null;
}
