import { INodeService } from "../nodeServices";
import { IDbService } from "../dbServices";
import { Node } from "../../models/Node";
import { v4 as uuidv4 } from 'uuid';

export class NodeImpl implements INodeService {
    constructor(private dbService: IDbService) {}

    getAllNodes(): Node[] {
        return this.dbService.getAllNodes();
    }

    createNode(ip: string): Node {
        const newNode: Node = {
            id: uuidv4(),
            ip,
            trustScore: 50, // Default starting score
            status: 'pending',
            stage: 'Verification'
        };
        this.dbService.addNode(newNode);
        return newNode;
    }
}