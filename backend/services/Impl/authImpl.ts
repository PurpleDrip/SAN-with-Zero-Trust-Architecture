import { IAuthService } from '../authServices';
import { IDbService } from '../dbServices';
import { AuditLogger } from '../../utils/nodeHelpers';
import crypto from 'crypto';
import { getConfig, isDemoMode } from '../../config/systemConfig';

// ============================================
// AUTHENTICATION IMPLEMENTATION
// ============================================

export class AuthImpl implements IAuthService {
    private tokenStore: Map<string, { nodeId: string; expiresAt: Date }> = new Map();
    private readonly SECRET_KEY = 'zero-trust-san-secret-key-change-in-production';

    constructor(private dbService: IDbService) {}

    /**
     * Authenticate a node with credentials
     */
    authenticate(nodeId: string, credentials: { username?: string; password?: string }): boolean {
        const node = this.dbService.getNodeById(nodeId);
        if (!node) return false;

        // In demo mode, always succeed
        if (isDemoMode()) {
            AuditLogger.log(node, 'auth', 'info', 'Demo mode: Authentication bypassed');
            return true;
        }

        // Check if node has credentials set
        if (!node.authCredentials) {
            AuditLogger.log(node, 'auth', 'warning', 'No credentials configured for node');
            return false;
        }

        // Verify username
        if (credentials.username !== node.authCredentials.username) {
            node.behaviorMetrics.failedAuthAttempts++;
            AuditLogger.log(node, 'auth', 'warning', 'Authentication failed: Invalid username');
            this.dbService.updateNode(node);
            return false;
        }

        // Verify password
        if (credentials.password && node.authCredentials.hashedPassword) {
            const isValid = this.verifyPassword(credentials.password, node.authCredentials.hashedPassword);
            
            if (!isValid) {
                node.behaviorMetrics.failedAuthAttempts++;
                AuditLogger.log(node, 'auth', 'warning', 'Authentication failed: Invalid password');
                this.dbService.updateNode(node);
                return false;
            }
        }

        // Success
        node.behaviorMetrics.loginAttempts++;
        node.authCredentials.lastAuthTime = new Date();
        AuditLogger.log(node, 'auth', 'info', 'Authentication successful');
        this.dbService.updateNode(node);
        
        return true;
    }

    /**
     * Generate JWT-like token for a node
     */
    generateToken(nodeId: string): string {
        const node = this.dbService.getNodeById(nodeId);
        if (!node) throw new Error('Node not found');

        // Create token payload
        const payload = {
            nodeId: nodeId,
            ip: node.ip,
            issuedAt: Date.now(),
            expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
        };

        // Simple token generation (in production, use jsonwebtoken library)
        const tokenData = JSON.stringify(payload);
        const signature = this.createSignature(tokenData);
        const token = Buffer.from(tokenData).toString('base64') + '.' + signature;

        // Store token
        this.tokenStore.set(token, {
            nodeId: nodeId,
            expiresAt: new Date(payload.expiresAt)
        });

        AuditLogger.log(node, 'auth', 'info', 'Token generated');
        
        return token;
    }

    /**
     * Validate a token
     */
    validateToken(token: string): { valid: boolean; nodeId?: string } {
        try {
            const [encodedPayload, signature] = token.split('.');
            
            // Verify signature
            const payload = Buffer.from(encodedPayload, 'base64').toString();
            const expectedSignature = this.createSignature(payload);
            
            if (signature !== expectedSignature) {
                return { valid: false };
            }

            // Check if token exists in store
            const tokenData = this.tokenStore.get(token);
            if (!tokenData) {
                return { valid: false };
            }

            // Check expiration
            if (tokenData.expiresAt < new Date()) {
                this.tokenStore.delete(token);
                return { valid: false };
            }

            return { valid: true, nodeId: tokenData.nodeId };
        } catch (error) {
            return { valid: false };
        }
    }

    /**
     * Hash password using SHA-256
     */
    hashPassword(password: string): string {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    /**
     * Verify password against hash
     */
    verifyPassword(password: string, hash: string): boolean {
        const passwordHash = this.hashPassword(password);
        return passwordHash === hash;
    }

    /**
     * Create signature for token
     */
    private createSignature(data: string): string {
        return crypto
            .createHmac('sha256', this.SECRET_KEY)
            .update(data)
            .digest('hex');
    }

    /**
     * Revoke a token
     */
    revokeToken(token: string): void {
        this.tokenStore.delete(token);
    }

    /**
     * Clean up expired tokens
     */
    cleanupExpiredTokens(): void {
        const now = new Date();
        for (const [token, data] of this.tokenStore.entries()) {
            if (data.expiresAt < now) {
                this.tokenStore.delete(token);
            }
        }
    }
}
