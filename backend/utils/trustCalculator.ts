import { Node, TrustScoreBreakdown } from '../models/Node';
import { getConfig } from '../config/systemConfig';

// ============================================
// TRUST SCORE CALCULATION ENGINE
// ============================================

/**
 * Calculate comprehensive trust score based on multiple factors
 */
export class TrustScoreCalculator {
    
    /**
     * Calculate authentication score (0-25 points)
     */
    static calculateAuthScore(node: Node): number {
        let score = 0;
        const auth = node.authCredentials;

        if (!auth) return 0;

        // MFA enabled: +15 points
        if (auth.mfaEnabled) score += 15;

        // Has valid certificate: +5 points
        if (auth.certificateId) score += 5;

        // Recent successful auth: +5 points
        if (auth.lastAuthTime) {
            const hoursSinceAuth = (Date.now() - auth.lastAuthTime.getTime()) / (1000 * 60 * 60);
            if (hoursSinceAuth < 1) score += 5;
            else if (hoursSinceAuth < 24) score += 3;
        }

        return Math.min(score, 25);
    }

    /**
     * Calculate device health score (0-25 points)
     */
    static calculateHealthScore(node: Node): number {
        let score = 0;
        const health = node.healthMetrics;

        // Antivirus active: +7 points
        if (health.antivirusActive) score += 7;

        // Antivirus updated: +3 points
        if (health.antivirusUpdated) score += 3;

        // Firewall enabled: +7 points
        if (health.firewallEnabled) score += 7;

        // OS patched: +5 points
        if (health.osPatched) score += 5;

        // Disk encrypted: +3 points
        if (health.diskEncrypted) score += 3;

        return Math.min(score, 25);
    }

    /**
     * Calculate behavioral score (0-30 points)
     */
    static calculateBehaviorScore(node: Node): number {
        let score = 30; // Start with perfect score, deduct for issues
        const behavior = node.behaviorMetrics;
        const config = getConfig();

        // Check for suspicious activities
        if (behavior.suspiciousActivities.length > 0) {
            score -= behavior.suspiciousActivities.length * 5;
        }

        // Check failed auth attempts
        if (behavior.failedAuthAttempts > 0) {
            score -= behavior.failedAuthAttempts * 3;
        }

        // Check file access rate
        if (behavior.accessPatterns.length > 0) {
            const recentPatterns = behavior.accessPatterns.filter(p => {
                const minutesAgo = (Date.now() - p.timestamp.getTime()) / (1000 * 60);
                return minutesAgo < 1;
            });

            if (recentPatterns.length > config.behavior.maxFilesPerMinute) {
                score -= 10; // Excessive file access
            }
        }

        // Check data transfer volume
        const recentTransfer = this.calculateRecentDataTransfer(node);
        if (recentTransfer > config.behavior.maxDataTransferMB) {
            score -= 10; // Excessive data transfer
        }

        // Time-based anomaly (accessing at unusual hours)
        const currentHour = new Date().getHours();
        if (behavior.lastActivityTime) {
            const activityHour = behavior.lastActivityTime.getHours();
            // Penalize activity during off-hours (midnight to 6 AM)
            if (activityHour >= 0 && activityHour < 6) {
                score -= 5;
            }
        }

        return Math.max(0, Math.min(score, 30));
    }

    /**
     * Calculate network reputation score (0-20 points)
     */
    static calculateNetworkScore(node: Node): number {
        let score = 20; // Start with perfect score
        const network = node.networkInfo;

        // Blacklisted IP: -20 points (instant fail)
        if (network.isBlacklisted) return 0;

        // Threat level penalties
        switch (network.threatLevel) {
            case 'critical':
                score -= 20;
                break;
            case 'high':
                score -= 15;
                break;
            case 'medium':
                score -= 10;
                break;
            case 'low':
                score -= 5;
                break;
            case 'none':
                // No penalty
                break;
        }

        // Geolocation consistency check
        if (network.geolocation) {
            // In production, you'd compare with historical locations
            // For now, just check if geolocation is available
            score += 0; // Placeholder for future logic
        }

        return Math.max(0, Math.min(score, 20));
    }

    /**
     * Calculate overall trust score
     */
    static calculateTrustScore(node: Node): TrustScoreBreakdown {
        const authScore = this.calculateAuthScore(node);
        const healthScore = this.calculateHealthScore(node);
        const behaviorScore = this.calculateBehaviorScore(node);
        const networkScore = this.calculateNetworkScore(node);

        const totalScore = authScore + healthScore + behaviorScore + networkScore;

        return {
            authenticationScore: authScore,
            deviceHealthScore: healthScore,
            behavioralScore: behaviorScore,
            networkReputationScore: networkScore,
            totalScore: Math.round(totalScore),
            lastCalculated: new Date()
        };
    }

    /**
     * Determine access level based on trust score
     */
    static determineAccessLevel(trustScore: number): 'none' | 'restricted' | 'limited' | 'full' {
        const config = getConfig();

        if (trustScore >= config.trustThresholds.fullAccess) {
            return 'full';
        } else if (trustScore >= config.trustThresholds.limitedAccess) {
            return 'limited';
        } else if (trustScore >= config.trustThresholds.restrictedAccess) {
            return 'restricted';
        } else {
            return 'none';
        }
    }

    /**
     * Helper: Calculate recent data transfer
     */
    private static calculateRecentDataTransfer(node: Node): number {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const recentPatterns = node.behaviorMetrics.accessPatterns.filter(
            p => p.timestamp.getTime() > oneHourAgo
        );

        return recentPatterns.reduce((sum, p) => sum + p.dataSize, 0) / (1024 * 1024); // Convert to MB
    }
}

// ============================================
// ANOMALY DETECTION
// ============================================

export class AnomalyDetector {
    
    /**
     * Detect ransomware-like behavior
     */
    static detectRansomware(node: Node): boolean {
        const behavior = node.behaviorMetrics;
        const recentPatterns = behavior.accessPatterns.filter(p => {
            const minutesAgo = (Date.now() - p.timestamp.getTime()) / (1000 * 60);
            return minutesAgo < 5;
        });

        // Check for mass file encryption pattern
        const writeOperations = recentPatterns.filter(p => p.operation === 'write');
        
        // Ransomware indicator: Many files written in short time
        if (writeOperations.length > 50) {
            return true;
        }

        // Check for suspicious file extensions in access patterns
        const suspiciousExtensions = ['.encrypted', '.locked', '.crypto'];
        const hasSuspiciousFiles = recentPatterns.some(p => 
            suspiciousExtensions.some(ext => p.fileAccessed.endsWith(ext))
        );

        return hasSuspiciousFiles;
    }

    /**
     * Detect data exfiltration
     */
    static detectDataExfiltration(node: Node): boolean {
        const config = getConfig();
        const recentTransfer = node.behaviorMetrics.dataTransferred;

        // Excessive data transfer in short time
        return recentTransfer > config.behavior.maxDataTransferMB * 2;
    }

    /**
     * Detect brute force attempts
     */
    static detectBruteForce(node: Node): boolean {
        const behavior = node.behaviorMetrics;
        
        // Multiple failed auth attempts
        return behavior.failedAuthAttempts > 5;
    }

    /**
     * Comprehensive anomaly check
     */
    static detectAnomalies(node: Node): string[] {
        const anomalies: string[] = [];

        if (this.detectRansomware(node)) {
            anomalies.push('Ransomware-like behavior detected');
        }

        if (this.detectDataExfiltration(node)) {
            anomalies.push('Excessive data exfiltration detected');
        }

        if (this.detectBruteForce(node)) {
            anomalies.push('Brute force attack detected');
        }

        return anomalies;
    }
}
