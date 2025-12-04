import { Request, Response } from 'express';
import { INodeService } from '../services/nodeServices';

export class NodeController {
    constructor(private nodeService: INodeService) {}

    getNodes = (req: Request, res: Response) => {
        const nodes = this.nodeService.getAllNodes();
        res.json(nodes);
    };

    createNode = (req: Request, res: Response) => {
        const { ip } = req.body;
        const newNode = this.nodeService.createNode(ip);
        res.status(201).json(newNode);
    };
}