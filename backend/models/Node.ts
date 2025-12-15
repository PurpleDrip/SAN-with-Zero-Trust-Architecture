// ============================================
// DEVICE IDENTITY & AUTHENTICATION
// ============================================
export interface DeviceFingerprint {
    macAddress?: string;
    hostname?: string;
    osType: string;
    osVersion: string;
    deviceType: 'desktop' | 'laptop' | 'server' | 'mobile' | 'unknown';
}

export interface AuthCredentials {
    username?: string;
    hashedPassword?: string;
    publicKey?: string;
    certificateId?: string;
    mfaEnabled: boolean;
    lastAuthTime?: Date;
}

// ============================================
// DEVICE HEALTH & POSTURE
// ============================================
export interface HealthMetrics {
    antivirusActive: boolean;
    antivirusUpdated: boolean;
    firewallEnabled: boolean;
    osPatched: boolean;
    diskEncrypted: boolean;
    lastHealthCheck: Date;
    healthScore: number; // 0-100
}

// ============================================
// BEHAVIORAL TRACKING
// ============================================
export interface BehaviorMetrics {
    filesAccessed: number;
    dataTransferred: number; // in MB
    loginAttempts: number;
    failedAuthAttempts: number;
    suspiciousActivities: string[];
    lastActivityTime: Date;
    accessPatterns: AccessPattern[];
}

export interface AccessPattern {
    timestamp: Date;
    fileAccessed: string;
    operation: 'read' | 'write' | 'delete' | 'execute';
    dataSize: number;
}

// ============================================
// TRUST SCORE BREAKDOWN
// ============================================
export interface TrustScoreBreakdown {
    authenticationScore: number; // 0-25
    deviceHealthScore: number;   // 0-25
    behavioralScore: number;      // 0-30
    networkReputationScore: number; // 0-20
    totalScore: number;           // 0-100
    lastCalculated: Date;
}

// ============================================
// SESSION MANAGEMENT
// ============================================
export interface Session {
    sessionId: string;
    token?: string;
    startTime: Date;
    lastHeartbeat: Date;
    expiresAt: Date;
    isActive: boolean;
}

// ============================================
// NETWORK & SECURITY
// ============================================
export interface NetworkInfo {
    ipAddress: string;
    port?: number;
    geolocation?: {
        country: string;
        city: string;
        latitude: number;
        longitude: number;
    };
    isBlacklisted: boolean;
    threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

// ============================================
// MAIN NODE INTERFACE
// ============================================
export interface Node {
    // Basic Identity
    id: string;
    createdAt: Date;
    updatedAt: Date;

    // Status & Stage
    status: 'pending' | 'active' | 'blocked' | 'suspended';
    stage: 'Verification' | 'Scoring' | 'Active Session' | 'Blocked';

    // Core Components
    ip: string;
    trustScore: number; // Overall score (0-100)
    trustBreakdown: TrustScoreBreakdown;

    // Device Information
    deviceFingerprint: DeviceFingerprint;
    authCredentials?: AuthCredentials;

    // Health & Security
    healthMetrics: HealthMetrics;
    networkInfo: NetworkInfo;

    // Behavior & Monitoring
    behaviorMetrics: BehaviorMetrics;

    // Session
    session?: Session;

    // Access Control
    accessLevel: 'none' | 'restricted' | 'limited' | 'full';
    allowedResources: string[];

    // Audit Trail
    logs: AuditLog[];
}

// ============================================
// AUDIT & LOGGING
// ============================================
export interface AuditLog {
    timestamp: Date;
    eventType: 'auth' | 'access' | 'trust_change' | 'violation' | 'system';
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    metadata?: any;
}

