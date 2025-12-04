import { Node } from "../models/Node";

export interface IDbService {
    getAllNodes(): Node[];
    getNodeById(id: string): Node | undefined;
    addNode(node: Node): void;
    updateNode(node: Node): void;
}