import { Node } from "../models/Node";

export interface ITrustService {
    calculateTrust(nodeId: string): Node | null;
    simulateAttack(nodeId: string): Node | null;
}