import express from 'express';
import cors from 'cors';

// Configuration
import { getConfig, setMode, SystemMode } from './config/systemConfig';

// Implementations
import { DbImpl } from './services/Impl/dbImpl';
import { NodeImpl } from './services/Impl/nodeImpl';
import { TrustImpl } from './services/Impl/trustImpl';
import { AuthImpl } from './services/Impl/authImpl';
import { HealthCheckImpl } from './services/Impl/healthCheckImpl';

// Controllers
import { NodeController } from './controllers/nodeController';
import { TrustController } from './controllers/trustController';

// Routes
import { createNodeRouter } from './routes/nodeRoutes';
import { createTrustRouter } from './routes/trustRoutes';

const app = express();
app.use(express.json());
app.use(cors());

console.log('🛡️  Zero Trust SAN - Starting...');
console.log('================================================');

// 1. Initialize Services (Singleton Pattern)
const dbService = new DbImpl();
const nodeService = new NodeImpl(dbService);
const trustService = new TrustImpl(dbService);
const authService = new AuthImpl(dbService);
const healthCheckService = new HealthCheckImpl(dbService);

// 2. Initialize Controllers
const nodeController = new NodeController(nodeService);
const trustController = new TrustController(trustService);

// 3. Define Routes
app.use('/api/nodes', createNodeRouter(nodeController));
app.use('/api/trust', createTrustRouter(trustController));

// 4. System Configuration Endpoints
app.get('/api/config', (req, res) => {
    const config = getConfig();
    res.json({
        mode: config.mode,
        trustThresholds: config.trustThresholds,
        security: {
            enforceFirewall: config.security.enforceFirewall,
            requireMFA: config.security.requireMFA,
            requireEncryption: config.security.requireEncryption
        }
    });
});

app.post('/api/config/mode', (req, res) => {
    const { mode } = req.body;
    
    if (mode !== 'demo' && mode !== 'production') {
        return res.status(400).json({ error: 'Invalid mode. Must be "demo" or "production"' });
    }

    setMode(mode as SystemMode);
    res.json({ 
        message: `System mode changed to ${mode}`,
        mode: getConfig().mode 
    });
});

// 5. Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        mode: getConfig().mode,
        timestamp: new Date().toISOString(),
        services: {
            database: 'operational',
            trustEngine: 'operational',
            authService: 'operational',
            healthCheck: 'operational'
        }
    });
});

// 6. Start Background Tasks
const startBackgroundTasks = () => {
    // Periodic trust score recalculation
    setInterval(() => {
        const nodes = dbService.getAllNodes();
        nodes.forEach(node => {
            if (node.status === 'active') {
                trustService.monitorBehavior(node.id);
            }
        });
    }, 60000); // Every minute

    // Token cleanup
    setInterval(() => {
        authService.cleanupExpiredTokens();
    }, 300000); // Every 5 minutes

    console.log('✅ Background tasks started');
};

const PORT = 3000;
app.listen(PORT, () => {
    const config = getConfig();
    console.log(`🛡️  Zero Trust Controller running on http://localhost:${PORT}`);
    console.log(`📊 Mode: ${config.mode.toUpperCase()}`);
    console.log(`🔥 Firewall Enforcement: ${config.security.enforceFirewall ? 'ENABLED' : 'DISABLED'}`);
    console.log('================================================');
    
    startBackgroundTasks();
});
