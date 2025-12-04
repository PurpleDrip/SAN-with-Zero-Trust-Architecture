import express from 'express';
import cors from 'cors'; // npm install cors @types/cors

// Implementations
import { DbImpl } from './services/Impl/dbImpl';
import { NodeImpl } from './services/Impl/nodeImpl';
import { TrustImpl } from './services/Impl/trustImpl';

// Controllers
import { NodeController } from './controllers/nodeController';
import { TrustController } from './controllers/trustController';

// Routes
import { createNodeRouter } from './routes/nodeRoutes';
import { createTrustRouter } from './routes/trustRoutes';

const app = express();
app.use(express.json());
app.use(cors());

// 1. Initialize Services (Singleton Pattern)
const dbService = new DbImpl();
const nodeService = new NodeImpl(dbService);
const trustService = new TrustImpl(dbService);

// 2. Initialize Controllers
const nodeController = new NodeController(nodeService);
const trustController = new TrustController(trustService);

// 3. Define Routes
app.use('/api/nodes', createNodeRouter(nodeController));
app.use('/api/trust', createTrustRouter(trustController));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🛡️ Zero Trust Controller running on http://localhost:${PORT}`);
});