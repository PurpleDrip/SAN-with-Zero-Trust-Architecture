import { INodeService } from "../nodeServices";
import { IDbService } from "../dbServices";
import { Node, DeviceFingerprint } from "../../models/Node";
import { NodeFactory, AuditLogger } from "../../utils/nodeHelpers";

export class NodeImpl implements INodeService {
    constructor(private dbService: IDbService) {}

    getAllNodes(): Node[] {
        return this.dbService.getAllNodes();
    }

    getNodeById(id: string): Node | undefined {
        return this.dbService.getNodeById(id);
    }

    createNode(ip: string, deviceInfo?: Partial<DeviceFingerprint>): Node {
        // Create node using factory
        const newNode = NodeFactory.createNode(ip, deviceInfo);
        
        AuditLogger.log(
            newNode,
            'system',
            'info',
            `New connection request from ${ip}`,
            { deviceInfo }
        );

        this.dbService.addNode(newNode);
        return newNode;
    }

    deleteNode(id: string): boolean {
        const node = this.dbService.getNodeById(id);
        if (!node) return false;

        AuditLogger.log(node, 'system', 'info', 'Node removed from system');
        
        // In a real implementation, you'd have a delete method in dbService
        // For now, we'll just return true
        return true;
    }
}
