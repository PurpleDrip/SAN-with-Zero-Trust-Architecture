import { Request, Response } from 'express';
import { INodeService } from '../services/nodeServices';
import { ITrustService } from '../services/trustServices';

export class NodeController {
    constructor(
        private nodeService: INodeService,
        private trustService?: ITrustService
    ) {}

    getNodes = (req: Request, res: Response) => {
        const nodes = this.nodeService.getAllNodes();
        res.json(nodes);
    };

    createNode = (req: Request, res: Response) => {
        const { 
            ip, 
            deviceInfo, 
            healthMetrics, 
            networkInfo, 
            behaviorMetrics, 
            authCredentials,
            preset 
        } = req.body;
        
        if (!ip) {
            return res.status(400).json({ error: 'IP address is required' });
        }

        // Create the node
        const newNode = this.nodeService.createNode(ip, deviceInfo);

        // Apply health metrics if provided
        if (healthMetrics) {
            newNode.healthMetrics = {
                ...newNode.healthMetrics,
                antivirusActive: healthMetrics.antivirusActive ?? newNode.healthMetrics.antivirusActive,
                antivirusUpdated: healthMetrics.antivirusUpdated ?? newNode.healthMetrics.antivirusUpdated,
                firewallEnabled: healthMetrics.firewallEnabled ?? newNode.healthMetrics.firewallEnabled,
                osPatched: healthMetrics.osPatched ?? newNode.healthMetrics.osPatched,
                diskEncrypted: healthMetrics.diskEncrypted ?? newNode.healthMetrics.diskEncrypted,
                lastHealthCheck: new Date()
            };
            
            // Recalculate health score
            newNode.healthMetrics.healthScore = this.calculateHealthScore(newNode.healthMetrics);
        }

        // Apply network info if provided
        if (networkInfo) {
            newNode.networkInfo = {
                ...newNode.networkInfo,
                threatLevel: networkInfo.threatLevel ?? newNode.networkInfo.threatLevel,
                isBlacklisted: networkInfo.isBlacklisted ?? newNode.networkInfo.isBlacklisted
            };
        }

        // Apply behavior metrics if provided
        if (behaviorMetrics) {
            newNode.behaviorMetrics = {
                ...newNode.behaviorMetrics,
                filesAccessed: behaviorMetrics.filesAccessed ?? newNode.behaviorMetrics.filesAccessed,
                dataTransferred: behaviorMetrics.dataTransferred ?? newNode.behaviorMetrics.dataTransferred,
                failedAuthAttempts: behaviorMetrics.failedAuthAttempts ?? newNode.behaviorMetrics.failedAuthAttempts,
                suspiciousActivities: behaviorMetrics.suspiciousActivities ?? newNode.behaviorMetrics.suspiciousActivities
            };
        }

        // Apply auth credentials if provided
        if (authCredentials) {
            const crypto = require('crypto');
            newNode.authCredentials = {
                username: authCredentials.username,
                hashedPassword: authCredentials.password 
                    ? crypto.createHash('sha256').update(authCredentials.password).digest('hex')
                    : undefined,
                mfaEnabled: authCredentials.mfaEnabled ?? false,
                certificateId: authCredentials.hasCertificate ? 'cert-' + Date.now() : undefined,
                lastAuthTime: new Date()
            };
        }

        // Update the node in database
        this.nodeService.updateNode(newNode);

        // Calculate trust score if trust service is available
        let finalNode = newNode;
        if (this.trustService) {
            const calculatedNode = this.trustService.calculateTrust(newNode.id);
            if (calculatedNode) {
                finalNode = calculatedNode;
            }
        }

        res.status(201).json(finalNode);
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

    // Helper method to calculate health score
    private calculateHealthScore(metrics: any): number {
        let score = 0;
        if (metrics.antivirusActive) score += 25;
        if (metrics.antivirusUpdated) score += 15;
        if (metrics.firewallEnabled) score += 25;
        if (metrics.osPatched) score += 20;
        if (metrics.diskEncrypted) score += 15;
        return Math.min(score, 100);
    }
}

