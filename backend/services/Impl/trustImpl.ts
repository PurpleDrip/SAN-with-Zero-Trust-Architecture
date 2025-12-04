import { ITrustService } from "../trustServices";
import { IDbService } from "../dbServices";
import { Node } from "../../models/Node";
// import { exec } from "child_process"; // Uncomment for real Linux commands

export class TrustImpl implements ITrustService {
    constructor(private dbService: IDbService) {}

    calculateTrust(nodeId: string): Node | null {
        const node = this.dbService.getNodeById(nodeId);
        if (!node) return null;

        // Simulate calculation
        node.trustScore = Math.floor(Math.random() * (100 - 80 + 1) + 80); // Random score 80-100
        node.stage = 'Active Session';
        node.status = 'active';
        
        this.dbService.updateNode(node);
        return node;
    }

    simulateAttack(nodeId: string): Node | null {
        const node = this.dbService.getNodeById(nodeId);
        if (!node) return null;

        // 1. Drop Score
        node.trustScore = 20;
        node.status = 'blocked';
        node.stage = 'Blocked';

        // 2. Mock System Command
        console.log(`[System] Executing: iptables -D INPUT -s ${node.ip} -j ACCEPT`);
        // exec(`sudo iptables -D INPUT -s ${node.ip} -j ACCEPT`);

        this.dbService.updateNode(node);
        return node;
    }
}