import { IDbService } from "../dbServices";
import { Node } from "../../models/Node";
import { NodeFactory } from "../../utils/nodeHelpers";
import { isDemoMode } from "../../config/systemConfig";

export class DbImpl implements IDbService {
    // This array acts as your database
    private nodes: Node[] = [];

    constructor() {
        // Initialize with demo data if in demo mode
        if (isDemoMode()) {
            this.initializeDemoData();
        }
    }

    /**
     * Initialize demo nodes for visualization
     */
    private initializeDemoData(): void {
        console.log('🎭 Initializing demo data...');
        
        // Create a healthy node
        const healthyNode = NodeFactory.createDemoNode('healthy');
        this.nodes.push(healthyNode);

        // Create a node in verification stage
        const verifyingNode = NodeFactory.createNode('192.168.1.20', {
            osType: 'Windows',
            osVersion: '11',
            deviceType: 'desktop',
            hostname: 'workstation-01'
        });
        this.nodes.push(verifyingNode);

        // Create a suspicious node
        const suspiciousNode = NodeFactory.createDemoNode('suspicious');
        this.nodes.push(suspiciousNode);

        console.log(`✅ Created ${this.nodes.length} demo nodes`);
    }

    getAllNodes(): Node[] {
        return this.nodes;
    }

    getNodeById(id: string): Node | undefined {
        return this.nodes.find(n => n.id === id);
    }

    addNode(node: Node): void {
        this.nodes.push(node);
    }

    updateNode(node: Node): void {
        const index = this.nodes.findIndex(n => n.id === node.id);
        if (index !== -1) {
            node.updatedAt = new Date();
            this.nodes[index] = node;
        }
    }

    deleteNode(id: string): boolean {
        const index = this.nodes.findIndex(n => n.id === id);
        if (index !== -1) {
            this.nodes.splice(index, 1);
            return true;
        }
        return false;
    }
}
