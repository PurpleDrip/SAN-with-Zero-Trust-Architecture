import { Node, AuthCredentials } from '../models/Node';
import { AuditLogger } from '../utils/nodeHelpers';
import crypto from 'crypto';

// ============================================
// AUTHENTICATION SERVICE INTERFACE
// ============================================

export interface IAuthService {
    authenticate(nodeId: string, credentials: AuthCredentials): boolean;
    generateToken(nodeId: string): string;
    validateToken(token: string): { valid: boolean; nodeId?: string };
    hashPassword(password: string): string;
    verifyPassword(password: string, hash: string): boolean;
}
