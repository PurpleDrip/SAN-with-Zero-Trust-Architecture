// ============================================
// SYSTEM MODE CONFIGURATION
// ============================================

export type SystemMode = 'demo' | 'production';

export interface SystemConfig {
    mode: SystemMode;
    
    // Trust Score Thresholds
    trustThresholds: {
        fullAccess: number;      // >= 90
        limitedAccess: number;   // >= 70
        restrictedAccess: number; // >= 50
        blocked: number;         // < 50
    };

    // Session Configuration
    session: {
        idleTimeout: number;        // minutes
        absoluteTimeout: number;    // minutes
        heartbeatInterval: number;  // seconds
        reauthInterval: number;     // minutes
    };

    // Health Check Configuration
    healthCheck: {
        interval: number;           // seconds
        requiredChecks: string[];   // ['antivirus', 'firewall', 'osPatched']
    };

    // Behavioral Monitoring
    behavior: {
        maxFilesPerMinute: number;
        maxDataTransferMB: number;
        anomalyThreshold: number;   // Standard deviations
    };

    // Security Policies
    security: {
        enforceFirewall: boolean;
        requireMFA: boolean;
        requireEncryption: boolean;
        allowedIPRanges?: string[];
        blacklistedIPs: string[];
    };

    // Demo Mode Settings
    demo: {
        autoSimulateAttacks: boolean;
        simulationInterval: number; // seconds
        mockDevices: number;
    };
}

// ============================================
// DEFAULT CONFIGURATIONS
// ============================================

export const DEMO_CONFIG: SystemConfig = {
    mode: 'demo',
    
    trustThresholds: {
        fullAccess: 90,
        limitedAccess: 70,
        restrictedAccess: 50,
        blocked: 50
    },

    session: {
        idleTimeout: 15,
        absoluteTimeout: 480,
        heartbeatInterval: 30,
        reauthInterval: 30
    },

    healthCheck: {
        interval: 60,
        requiredChecks: ['antivirus', 'firewall']
    },

    behavior: {
        maxFilesPerMinute: 100,
        maxDataTransferMB: 1000,
        anomalyThreshold: 2.5
    },

    security: {
        enforceFirewall: false, // Don't actually modify firewall in demo
        requireMFA: false,
        requireEncryption: false,
        blacklistedIPs: []
    },

    demo: {
        autoSimulateAttacks: true,
        simulationInterval: 120,
        mockDevices: 5
    }
};

export const PRODUCTION_CONFIG: SystemConfig = {
    mode: 'production',
    
    trustThresholds: {
        fullAccess: 90,
        limitedAccess: 70,
        restrictedAccess: 50,
        blocked: 50
    },

    session: {
        idleTimeout: 15,
        absoluteTimeout: 480,
        heartbeatInterval: 30,
        reauthInterval: 30
    },

    healthCheck: {
        interval: 300, // 5 minutes
        requiredChecks: ['antivirus', 'firewall', 'osPatched', 'diskEncrypted']
    },

    behavior: {
        maxFilesPerMinute: 50,
        maxDataTransferMB: 500,
        anomalyThreshold: 2.0
    },

    security: {
        enforceFirewall: true, // Actually modify firewall rules
        requireMFA: true,
        requireEncryption: true,
        allowedIPRanges: ['192.168.0.0/16', '10.0.0.0/8'],
        blacklistedIPs: []
    },

    demo: {
        autoSimulateAttacks: false,
        simulationInterval: 0,
        mockDevices: 0
    }
};

// ============================================
// ACTIVE CONFIGURATION
// ============================================

// Change this to switch between modes
let activeConfig: SystemConfig = DEMO_CONFIG;

export const getConfig = (): SystemConfig => activeConfig;

export const setMode = (mode: SystemMode): void => {
    activeConfig = mode === 'demo' ? DEMO_CONFIG : PRODUCTION_CONFIG;
    console.log(`🔧 System mode changed to: ${mode.toUpperCase()}`);
};

export const isProductionMode = (): boolean => activeConfig.mode === 'production';
export const isDemoMode = (): boolean => activeConfig.mode === 'demo';
