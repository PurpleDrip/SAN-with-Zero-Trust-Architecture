import { Request, Response } from 'express';
import { INodeService } from '../services/nodeServices';

export class NodeController {
    constructor(private nodeService: INodeService) {}

    getNodes = (req: Request, res: Response) => {
        const nodes = this.nodeService.getAllNodes();
        res.json(nodes);
    };

    createNode = (req: Request, res: Response) => {
        const { ip, deviceInfo } = req.body;
        
        if (!ip) {
            return res.status(400).json({ error: 'IP address is required' });
        }

        const newNode = this.nodeService.createNode(ip, deviceInfo);
        res.status(201).json(newNode);
    };

    getNode = (req: Request, res: Response) => {
        const { id } = req.params;
        const node = this.nodeService.getNodeById(id);
        
        if (!node) {
            return res.status(404).json({ error: 'Node not found' });
        }

        res.json(node);
    };

    deleteNode = (req: Request, res: Response) => {
        const { id } = req.params;
        const success = this.nodeService.deleteNode(id);
        
        if (!success) {
            return res.status(404).json({ error: 'Node not found' });
        }

        res.json({ message: 'Node deleted successfully' });
    };
}
