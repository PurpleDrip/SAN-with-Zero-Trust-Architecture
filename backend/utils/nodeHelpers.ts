import { Node, DeviceFingerprint, HealthMetrics, BehaviorMetrics, NetworkInfo, TrustScoreBreakdown, AuditLog } from '../models/Node';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// NODE FACTORY
// ============================================

export class NodeFactory {
    
    /**
     * Create a new node with default values
     */
    static createNode(ip: string, deviceInfo?: Partial<DeviceFingerprint>): Node {
        const now = new Date();

        const defaultFingerprint: DeviceFingerprint = {
            osType: deviceInfo?.osType || 'unknown',
            osVersion: deviceInfo?.osVersion || 'unknown',
            deviceType: deviceInfo?.deviceType || 'unknown',
            hostname: deviceInfo?.hostname,
            macAddress: deviceInfo?.macAddress
        };

        const defaultHealth: HealthMetrics = {
            antivirusActive: false,
            antivirusUpdated: false,
            firewallEnabled: false,
            osPatched: false,
            diskEncrypted: false,
            lastHealthCheck: now,
            healthScore: 0
        };

        const defaultBehavior: BehaviorMetrics = {
            filesAccessed: 0,
            dataTransferred: 0,
            loginAttempts: 0,
            failedAuthAttempts: 0,
            suspiciousActivities: [],
            lastActivityTime: now,
            accessPatterns: []
        };

        const defaultNetwork: NetworkInfo = {
            ipAddress: ip,
            isBlacklisted: false,
            threatLevel: 'none'
        };

        const defaultTrustBreakdown: TrustScoreBreakdown = {
            authenticationScore: 0,
            deviceHealthScore: 0,
            behavioralScore: 30, // Start with neutral behavior score
            networkReputationScore: 20, // Start with good network score
            totalScore: 50,
            lastCalculated: now
        };

        const node: Node = {
            id: uuidv4(),
            createdAt: now,
            updatedAt: now,
            status: 'pending',
            stage: 'Verification',
            ip: ip,
            trustScore: 50, // Default starting score
            trustBreakdown: defaultTrustBreakdown,
            deviceFingerprint: defaultFingerprint,
            healthMetrics: defaultHealth,
            networkInfo: defaultNetwork,
            behaviorMetrics: defaultBehavior,
            accessLevel: 'none',
            allowedResources: [],
            logs: [
                {
                    timestamp: now,
                    eventType: 'system',
                    severity: 'info',
                    message: `Node created from IP ${ip}`,
                    metadata: { ip }
                }
            ]
        };

        return node;
    }

    /**
     * Create a demo node with realistic mock data
     */
    static createDemoNode(scenario: 'healthy' | 'suspicious' | 'compromised'): Node {
        const ips = ['192.168.1.10', '192.168.1.11', '192.168.1.12', '10.0.0.5', '172.16.0.10'];
        const ip = ips[Math.floor(Math.random() * ips.length)];
        
        const node = this.createNode(ip, {
            osType: 'Linux',
            osVersion: 'Ubuntu 22.04',
            deviceType: 'server',
            hostname: `server-${Math.floor(Math.random() * 100)}`,
            macAddress: this.generateMacAddress()
        });

        switch (scenario) {
            case 'healthy':
                node.healthMetrics = {
                    antivirusActive: true,
                    antivirusUpdated: true,
                    firewallEnabled: true,
                    osPatched: true,
                    diskEncrypted: true,
                    lastHealthCheck: new Date(),
                    healthScore: 95
                };
                node.trustScore = 85 + Math.floor(Math.random() * 15);
                node.status = 'active';
                node.stage = 'Active Session';
                node.accessLevel = 'full';
                break;

            case 'suspicious':
                node.healthMetrics = {
                    antivirusActive: true,
                    antivirusUpdated: false,
                    firewallEnabled: true,
                    osPatched: false,
                    diskEncrypted: true,
                    lastHealthCheck: new Date(),
                    healthScore: 60
                };
                node.behaviorMetrics.suspiciousActivities = ['Unusual access pattern detected'];
                node.behaviorMetrics.filesAccessed = 150;
                node.trustScore = 55 + Math.floor(Math.random() * 15);
                node.status = 'active';
                node.stage = 'Active Session';
                node.accessLevel = 'limited';
                break;

            case 'compromised':
                node.healthMetrics = {
                    antivirusActive: false,
                    antivirusUpdated: false,
                    firewallEnabled: false,
                    osPatched: false,
                    diskEncrypted: false,
                    lastHealthCheck: new Date(),
                    healthScore: 20
                };
                node.behaviorMetrics.suspiciousActivities = [
                    'Ransomware-like behavior detected',
                    'Excessive data exfiltration detected'
                ];
                node.behaviorMetrics.filesAccessed = 500;
                node.behaviorMetrics.dataTransferred = 5000;
                node.networkInfo.threatLevel = 'high';
                node.trustScore = 15;
                node.status = 'blocked';
                node.stage = 'Blocked';
                node.accessLevel = 'none';
                break;
        }

        return node;
    }

    /**
     * Generate random MAC address
     */
    private static generateMacAddress(): string {
        const hexDigits = '0123456789ABCDEF';
        let mac = '';
        for (let i = 0; i < 6; i++) {
            if (i > 0) mac += ':';
            mac += hexDigits.charAt(Math.floor(Math.random() * 16));
            mac += hexDigits.charAt(Math.floor(Math.random() * 16));
        }
        return mac;
    }
}

// ============================================
// AUDIT LOGGER
// ============================================

export class AuditLogger {
    
    static log(
        node: Node,
        eventType: AuditLog['eventType'],
        severity: AuditLog['severity'],
        message: string,
        metadata?: any
    ): void {
        const logEntry: AuditLog = {
            timestamp: new Date(),
            eventType,
            severity,
            message,
            metadata
        };

        node.logs.push(logEntry);
        node.updatedAt = new Date();

        // Console log for visibility
        const emoji = this.getSeverityEmoji(severity);
        console.log(`${emoji} [${node.id.substring(0, 8)}] ${message}`);
    }

    private static getSeverityEmoji(severity: AuditLog['severity']): string {
        switch (severity) {
            case 'info': return 'ℹ️';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            case 'critical': return '🔥';
        }
    }

    static getRecentLogs(node: Node, count: number = 10): AuditLog[] {
        return node.logs.slice(-count);
    }
}

// ============================================
// IP UTILITIES
// ============================================

export class IPUtils {
    
    /**
     * Check if IP is in private range
     */
    static isPrivateIP(ip: string): boolean {
        const parts = ip.split('.').map(Number);
        
        // 10.0.0.0/8
        if (parts[0] === 10) return true;
        
        // 172.16.0.0/12
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
        
        // 192.168.0.0/16
        if (parts[0] === 192 && parts[1] === 168) return true;
        
        return false;
    }

    /**
     * Validate IP address format
     */
    static isValidIP(ip: string): boolean {
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        
        return parts.every(part => {
            const num = Number(part);
            return num >= 0 && num <= 255;
        });
    }

    /**
     * Check if IP is in CIDR range
     */
    static isIPInRange(ip: string, cidr: string): boolean {
        // Simplified CIDR check (for production, use a proper library)
        const [range, bits] = cidr.split('/');
        const rangeParts = range.split('.').map(Number);
        const ipParts = ip.split('.').map(Number);
        const maskBits = parseInt(bits);

        // Compare only the network portion
        const bytesToCheck = Math.floor(maskBits / 8);
        for (let i = 0; i < bytesToCheck; i++) {
            if (rangeParts[i] !== ipParts[i]) return false;
        }

        return true;
    }
}
