import { ITrustService } from "../trustServices";
import { IDbService } from "../dbServices";
import { Node } from "../../models/Node";
import { TrustScoreCalculator, AnomalyDetector } from "../../utils/trustCalculator";
import { AuditLogger } from "../../utils/nodeHelpers";
import { getConfig, isDemoMode } from "../../config/systemConfig";
import { exec } from "child_process";
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================
// TRUST SERVICE IMPLEMENTATION
// ============================================

export class TrustImpl implements ITrustService {
    constructor(private dbService: IDbService) {}

    /**
     * Calculate trust score using comprehensive algorithm
     */
    calculateTrust(nodeId: string): Node | null {
        const node = this.dbService.getNodeById(nodeId);
        if (!node) return null;

        // Calculate trust breakdown
        const trustBreakdown = TrustScoreCalculator.calculateTrustScore(node);
        node.trustBreakdown = trustBreakdown;
        node.trustScore = trustBreakdown.totalScore;

        // Determine access level based on score
        const accessLevel = TrustScoreCalculator.determineAccessLevel(node.trustScore);
        node.accessLevel = accessLevel;

        // Update stage based on trust score
        if (node.trustScore >= 70) {
            node.stage = 'Active Session';
            node.status = 'active';
        } else if (node.trustScore >= 50) {
            node.stage = 'Scoring';
            node.status = 'pending';
        } else {
            node.stage = 'Blocked';
            node.status = 'blocked';
        }

        AuditLogger.log(
            node,
            'trust_change',
            'info',
            `Trust score calculated: ${node.trustScore}/100 (Access: ${accessLevel})`,
            { trustBreakdown }
        );

        this.dbService.updateNode(node);
        return node;
    }

    /**
     * Monitor node behavior and update trust score
     */
    monitorBehavior(nodeId: string): Node | null {
        const node = this.dbService.getNodeById(nodeId);
        if (!node) return null;

        // Check for anomalies
        const anomalies = this.detectAnomalies(nodeId);

        if (anomalies.length > 0) {
            // Add to suspicious activities
            node.behaviorMetrics.suspiciousActivities.push(...anomalies);

            // Recalculate trust
            this.calculateTrust(nodeId);

            AuditLogger.log(
                node,
                'violation',
                'warning',
                `Anomalies detected: ${anomalies.join(', ')}`,
                { anomalies }
            );
        }

        return node;
    }

    /**
     * Detect behavioral anomalies
     */
    detectAnomalies(nodeId: string): string[] {
        const node = this.dbService.getNodeById(nodeId);
        if (!node) return [];

        return AnomalyDetector.detectAnomalies(node);
    }

    /**
     * Update trust score (recalculate)
     */
    updateTrustScore(nodeId: string): Node | null {
        return this.calculateTrust(nodeId);
    }

    /**
     * Simulate attack on a node
     */
    simulateAttack(nodeId: string): Node | null {
        const node = this.dbService.getNodeById(nodeId);
        if (!node) return null;

        // Simulate ransomware attack
        AuditLogger.log(node, 'violation', 'critical', '🔥 ATTACK SIMULATION: Ransomware detected!');

        // Add malicious behavior patterns
        const now = new Date();
        for (let i = 0; i < 100; i++) {
            node.behaviorMetrics.accessPatterns.push({
                timestamp: now,
                fileAccessed: `/data/file_${i}.encrypted`,
                operation: 'write',
                dataSize: 1024 * 1024 // 1MB
            });
        }

        node.behaviorMetrics.filesAccessed += 100;
        node.behaviorMetrics.dataTransferred += 100; // 100MB
        node.behaviorMetrics.suspiciousActivities.push('Ransomware-like behavior detected');

        // Drop trust score dramatically
        node.trustScore = 20;
        node.trustBreakdown.behavioralScore = 0;
        node.trustBreakdown.totalScore = 20;
        node.status = 'blocked';
        node.stage = 'Blocked';
        node.accessLevel = 'none';

        // Block the node
        this.blockNode(nodeId, 'Ransomware attack detected');

        this.dbService.updateNode(node);
        return node;
    }

    /**
     * Block a node and enforce firewall rules
     */
    blockNode(nodeId: string, reason: string): Node | null {
        const node = this.dbService.getNodeById(nodeId);
        if (!node) return null;

        node.status = 'blocked';
        node.stage = 'Blocked';
        node.accessLevel = 'none';

        AuditLogger.log(
            node,
            'system',
            'critical',
            `Node blocked: ${reason}`,
            { reason, ip: node.ip }
        );

        // Enforce firewall rule
        this.enforceFirewallBlock(node.ip);

        this.dbService.updateNode(node);
        return node;
    }

    /**
     * Unblock a node
     */
    unblockNode(nodeId: string): Node | null {
        const node = this.dbService.getNodeById(nodeId);
        if (!node) return null;

        node.status = 'pending';
        node.stage = 'Verification';
        
        // Clear suspicious activities
        node.behaviorMetrics.suspiciousActivities = [];
        node.behaviorMetrics.failedAuthAttempts = 0;

        AuditLogger.log(node, 'system', 'info', 'Node unblocked - re-verification required');

        // Remove firewall block
        this.removeFirewallBlock(node.ip);

        // Recalculate trust
        this.calculateTrust(nodeId);

        this.dbService.updateNode(node);
        return node;
    }

    // ============================================
    // FIREWALL MANAGEMENT
    // ============================================

    /**
     * Enforce firewall block (Production Mode)
     */
    private async enforceFirewallBlock(ip: string): Promise<void> {
        const config = getConfig();

        if (!config.security.enforceFirewall || isDemoMode()) {
            console.log(`[Demo/Disabled] Would execute: Block IP ${ip}`);
            return;
        }

        try {
            if (process.platform === 'linux') {
                // Linux: Use iptables
                await execAsync(`sudo iptables -A INPUT -s ${ip} -j DROP`);
                console.log(`✅ Firewall: Blocked ${ip} (iptables)`);
            } else if (process.platform === 'win32') {
                // Windows: Use netsh
                await execAsync(`netsh advfirewall firewall add rule name="Block_${ip}" dir=in action=block remoteip=${ip}`);
                console.log(`✅ Firewall: Blocked ${ip} (Windows Firewall)`);
            }
        } catch (error) {
            console.error(`❌ Failed to block ${ip}:`, (error as Error).message);
        }
    }

    /**
     * Remove firewall block (Production Mode)
     */
    private async removeFirewallBlock(ip: string): Promise<void> {
        const config = getConfig();

        if (!config.security.enforceFirewall || isDemoMode()) {
            console.log(`[Demo/Disabled] Would execute: Unblock IP ${ip}`);
            return;
        }

        try {
            if (process.platform === 'linux') {
                // Linux: Remove iptables rule
                await execAsync(`sudo iptables -D INPUT -s ${ip} -j DROP`);
                console.log(`✅ Firewall: Unblocked ${ip} (iptables)`);
            } else if (process.platform === 'win32') {
                // Windows: Remove netsh rule
                await execAsync(`netsh advfirewall firewall delete rule name="Block_${ip}"`);
                console.log(`✅ Firewall: Unblocked ${ip} (Windows Firewall)`);
            }
        } catch (error) {
            console.error(`❌ Failed to unblock ${ip}:`, (error as Error).message);
        }
    }

    /**
     * Grant firewall access (Production Mode)
     */
    private async grantFirewallAccess(ip: string): Promise<void> {
        const config = getConfig();

        if (!config.security.enforceFirewall || isDemoMode()) {
            console.log(`[Demo/Disabled] Would execute: Allow IP ${ip}`);
            return;
        }

        try {
            if (process.platform === 'linux') {
                // Linux: Allow in iptables
                await execAsync(`sudo iptables -A INPUT -s ${ip} -j ACCEPT`);
                console.log(`✅ Firewall: Allowed ${ip} (iptables)`);
            } else if (process.platform === 'win32') {
                // Windows: Allow in firewall
                await execAsync(`netsh advfirewall firewall add rule name="Allow_${ip}" dir=in action=allow remoteip=${ip}`);
                console.log(`✅ Firewall: Allowed ${ip} (Windows Firewall)`);
            }
        } catch (error) {
            console.error(`❌ Failed to allow ${ip}:`, (error as Error).message);
        }
    }
}
