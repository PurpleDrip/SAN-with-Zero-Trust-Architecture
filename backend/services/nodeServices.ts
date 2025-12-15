import { Node, DeviceFingerprint } from "../models/Node";

export interface INodeService {
    getAllNodes(): Node[];
    createNode(ip: string, deviceInfo?: Partial<DeviceFingerprint>): Node;
    getNodeById(id: string): Node | undefined;
    updateNode(node: Node): void;
    deleteNode(id: string): boolean;
}

