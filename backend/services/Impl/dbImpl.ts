import { IDbService } from "../dbServices";
import {Node} from "../../models/Node";

export class DbImpl implements IDbService {
    // This array acts as your database
    private nodes: Node[] = [
        { id: "node_1", ip: "192.168.1.5", trustScore: 85, status: "active", stage: "Active Session" },
        { id: "node_2", ip: "192.168.1.6", trustScore: 0, status: "pending", stage: "Verification" }
    ];

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
            this.nodes[index] = node;
        }
    }
}