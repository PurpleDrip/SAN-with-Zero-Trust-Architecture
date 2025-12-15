import { IHealthCheckService } from '../healthCheckServices';
import { IDbService } from '../dbServices';
import { Node, HealthMetrics } from '../../models/Node';
import { AuditLogger } from '../../utils/nodeHelpers';
import { getConfig, isDemoMode } from '../../config/systemConfig';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================
// HEALTH CHECK IMPLEMENTATION
// ============================================

export class HealthCheckImpl implements IHealthCheckService {
    
    constructor(private dbService: IDbService) {}

    /**
     * Perform health check on a node
     */
    performHealthCheck(nodeId: string, metrics: Partial<HealthMetrics>): Node | null {
        const node = this.dbService.getNodeById(nodeId);
        if (!node) return null;

        // Update health metrics
        node.healthMetrics = {
            ...node.healthMetrics,
            ...metrics,
            lastHealthCheck: new Date(),
            healthScore: this.getHealthScore({ ...node.healthMetrics, ...metrics })
        };

        // Validate health
        const isHealthy = this.validateHealthMetrics(node.healthMetrics);
        
        if (!isHealthy) {
            AuditLogger.log(
                node,
                'system',
                'warning',
                'Health check failed: Device does not meet security requirements',
                { healthScore: node.healthMetrics.healthScore }
            );
        } else {
            AuditLogger.log(
                node,
                'system',
                'info',
                'Health check passed',
                { healthScore: node.healthMetrics.healthScore }
            );
        }

        this.dbService.updateNode(node);
        return node;
    }

    /**
     * Validate if health metrics meet minimum requirements
     */
    validateHealthMetrics(metrics: HealthMetrics): boolean {
        const config = getConfig();
        const required = config.healthCheck.requiredChecks;

        // In demo mode, be lenient
        if (isDemoMode()) {
            return metrics.healthScore >= 50;
        }

        // Check required components
        const checks: Record<string, boolean> = {
            'antivirus': metrics.antivirusActive,
            'firewall': metrics.firewallEnabled,
            'osPatched': metrics.osPatched,
            'diskEncrypted': metrics.diskEncrypted
        };

        // All required checks must pass
        for (const check of required) {
            if (!checks[check]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Calculate health score (0-100)
     */
    getHealthScore(metrics: HealthMetrics): number {
        let score = 0;

        if (metrics.antivirusActive) score += 25;
        if (metrics.antivirusUpdated) score += 15;
        if (metrics.firewallEnabled) score += 25;
        if (metrics.osPatched) score += 20;
        if (metrics.diskEncrypted) score += 15;

        return Math.min(score, 100);
    }

    /**
     * Perform real system health check (Production Mode)
     * This runs actual system commands to check device health
     */
    async performRealHealthCheck(nodeId: string): Promise<Node | null> {
        const node = this.dbService.getNodeById(nodeId);
        if (!node) return null;

        if (isDemoMode()) {
            AuditLogger.log(node, 'system', 'info', 'Demo mode: Skipping real health check');
            return node;
        }

        try {
            const metrics: Partial<HealthMetrics> = {};

            // Check if running on Linux
            if (process.platform === 'linux') {
                metrics.antivirusActive = await this.checkAntivirusLinux();
                metrics.firewallEnabled = await this.checkFirewallLinux();
                metrics.osPatched = await this.checkOSPatchedLinux();
                metrics.diskEncrypted = await this.checkDiskEncryptionLinux();
            } else if (process.platform === 'win32') {
                metrics.antivirusActive = await this.checkAntivirusWindows();
                metrics.firewallEnabled = await this.checkFirewallWindows();
                metrics.osPatched = await this.checkOSPatchedWindows();
            }

            return this.performHealthCheck(nodeId, metrics);
        } catch (error) {
            AuditLogger.log(
                node,
                'system',
                'error',
                'Real health check failed',
                { error: (error as Error).message }
            );
            return node;
        }
    }

    // ============================================
    // LINUX HEALTH CHECKS
    // ============================================

    private async checkAntivirusLinux(): Promise<boolean> {
        try {
            // Check for ClamAV
            const { stdout } = await execAsync('systemctl is-active clamav-daemon');
            return stdout.trim() === 'active';
        } catch {
            return false;
        }
    }

    private async checkFirewallLinux(): Promise<boolean> {
        try {
            // Check ufw or iptables
            const { stdout } = await execAsync('ufw status | grep -i "Status: active" || iptables -L | grep -i "Chain"');
            return stdout.length > 0;
        } catch {
            return false;
        }
    }

    private async checkOSPatchedLinux(): Promise<boolean> {
        try {
            // Check for available updates
            const { stdout } = await execAsync('apt list --upgradable 2>/dev/null | wc -l');
            const updateCount = parseInt(stdout.trim());
            return updateCount <= 5; // Allow up to 5 pending updates
        } catch {
            return false;
        }
    }

    private async checkDiskEncryptionLinux(): Promise<boolean> {
        try {
            // Check for LUKS encryption
            const { stdout } = await execAsync('lsblk -o NAME,FSTYPE | grep -i "crypto_LUKS"');
            return stdout.length > 0;
        } catch {
            return false;
        }
    }

    // ============================================
    // WINDOWS HEALTH CHECKS
    // ============================================

    private async checkAntivirusWindows(): Promise<boolean> {
        try {
            // Check Windows Defender
            const { stdout } = await execAsync('powershell "Get-MpComputerStatus | Select-Object -ExpandProperty AntivirusEnabled"');
            return stdout.trim().toLowerCase() === 'true';
        } catch {
            return false;
        }
    }

    private async checkFirewallWindows(): Promise<boolean> {
        try {
            // Check Windows Firewall
            const { stdout } = await execAsync('netsh advfirewall show allprofiles state');
            return stdout.includes('ON');
        } catch {
            return false;
        }
    }

    private async checkOSPatchedWindows(): Promise<boolean> {
        try {
            // Check for pending updates (simplified)
            const { stdout } = await execAsync('powershell "(New-Object -ComObject Microsoft.Update.Session).CreateUpdateSearcher().Search(\'IsInstalled=0\').Updates.Count"');
            const updateCount = parseInt(stdout.trim());
            return updateCount <= 5;
        } catch {
            return false;
        }
    }
}
