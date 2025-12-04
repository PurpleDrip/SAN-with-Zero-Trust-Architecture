import { Node } from "../models/Node";

export interface INodeService {
    getAllNodes(): Node[];
    createNode(ip: string): Node;
}