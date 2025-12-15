# 📁 Project Structure

## Overview
```
SAN using Zero Trust Architecture/
├── backend/                 # Node.js/TypeScript Backend
│   ├── config/             # System configuration
│   ├── controllers/        # API request handlers
│   ├── models/             # Data models & interfaces
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic interfaces
│   │   └── Impl/           # Service implementations
│   ├── utils/              # Helper functions
│   ├── index.ts            # Main server file
│   ├── package.json        # Dependencies
│   └── tsconfig.json       # TypeScript config
│
├── frontend/               # Python/Streamlit Dashboard
│   ├── app.py              # Main dashboard
│   └── requirements.txt    # Python dependencies
│
├── README.md               # Full documentation
├── QUICKSTART.md           # 5-minute setup guide
└── IMPLEMENTATION.md       # Implementation details
```

---

## 📂 Backend Structure (Detailed)

### `/config` - System Configuration
```
config/
└── systemConfig.ts         # Demo vs Production mode settings
    ├── DEMO_CONFIG         # Safe testing mode
    ├── PRODUCTION_CONFIG   # Real security enforcement
    └── getConfig()         # Active configuration
```

### `/models` - Data Models
```
models/
└── Node.ts                 # Complete data model
    ├── DeviceFingerprint   # MAC, hostname, OS
    ├── AuthCredentials     # Username, password, MFA
    ├── HealthMetrics       # AV, firewall, patches
    ├── BehaviorMetrics     # File access, data transfer
    ├── TrustScoreBreakdown # Detailed scoring
    ├── Session             # Token, heartbeat
    ├── NetworkInfo         # IP, geolocation, threats
    ├── AuditLog            # Event logging
    └── Node                # Main interface
```

### `/utils` - Helper Functions
```
utils/
├── trustCalculator.ts      # Trust scoring engine
│   ├── TrustScoreCalculator
│   │   ├── calculateAuthScore()
│   │   ├── calculateHealthScore()
│   │   ├── calculateBehaviorScore()
│   │   ├── calculateNetworkScore()
│   │   └── determineAccessLevel()
│   └── AnomalyDetector
│       ├── detectRansomware()
│       ├── detectDataExfiltration()
│       └── detectBruteForce()
│
└── nodeHelpers.ts          # Node utilities
    ├── NodeFactory
    │   ├── createNode()
    │   └── createDemoNode()
    ├── AuditLogger
    │   └── log()
    └── IPUtils
        ├── isPrivateIP()
        ├── isValidIP()
        └── isIPInRange()
```

### `/services` - Business Logic
```
services/
├── authServices.ts         # Auth interface
├── healthCheckServices.ts  # Health check interface
├── trustServices.ts        # Trust management interface
├── nodeServices.ts         # Node management interface
├── dbServices.ts           # Database interface
│
└── Impl/                   # Implementations
    ├── authImpl.ts         # JWT authentication
    │   ├── authenticate()
    │   ├── generateToken()
    │   ├── validateToken()
    │   └── hashPassword()
    │
    ├── healthCheckImpl.ts  # Device health checks
    │   ├── performHealthCheck()
    │   ├── performRealHealthCheck()
    │   ├── checkAntivirusLinux()
    │   ├── checkFirewallLinux()
    │   ├── checkAntivirusWindows()
    │   └── checkFirewallWindows()
    │
    ├── trustImpl.ts        # Trust management
    │   ├── calculateTrust()
    │   ├── monitorBehavior()
    │   ├── detectAnomalies()
    │   ├── blockNode()
    │   ├── unblockNode()
    │   ├── simulateAttack()
    │   ├── enforceFirewallBlock()
    │   └── removeFirewallBlock()
    │
    ├── nodeImpl.ts         # Node CRUD
    │   ├── getAllNodes()
    │   ├── getNodeById()
    │   ├── createNode()
    │   └── deleteNode()
    │
    └── dbImpl.ts           # Database operations
        ├── getAllNodes()
        ├── getNodeById()
        ├── addNode()
        ├── updateNode()
        ├── deleteNode()
        └── initializeDemoData()
```

### `/controllers` - API Handlers
```
controllers/
├── nodeController.ts       # Node endpoints
│   ├── getNodes()
│   ├── getNode()
│   ├── createNode()
│   └── deleteNode()
│
└── trustController.ts      # Trust endpoints
    ├── calculateTrust()
    ├── simulateAttack()
    ├── monitorBehavior()
    ├── detectAnomalies()
    ├── blockNode()
    └── unblockNode()
```

### `/routes` - API Routes
```
routes/
├── nodeRoutes.ts           # Node API routes
│   ├── GET    /api/nodes
│   ├── POST   /api/nodes
│   ├── GET    /api/nodes/:id
│   └── DELETE /api/nodes/:id
│
└── trustRoutes.ts          # Trust API routes
    ├── POST /api/trust/calculate
    ├── POST /api/trust/simulate-attack
    ├── POST /api/trust/monitor
    ├── GET  /api/trust/anomalies/:nodeId
    ├── POST /api/trust/block
    └── POST /api/trust/unblock
```

### `index.ts` - Main Server
```
index.ts
├── Initialize Services
│   ├── DbImpl
│   ├── NodeImpl
│   ├── TrustImpl
│   ├── AuthImpl
│   └── HealthCheckImpl
│
├── Initialize Controllers
│   ├── NodeController
│   └── TrustController
│
├── Define Routes
│   ├── /api/nodes
│   ├── /api/trust
│   ├── /api/config
│   └── /api/health
│
└── Background Tasks
    ├── Trust monitoring (every 1 min)
    └── Token cleanup (every 5 min)
```

---

## 🎨 Frontend Structure

### `/frontend`
```
frontend/
├── app.py                  # Streamlit dashboard
│   ├── Configuration
│   ├── fetch_nodes()
│   ├── trigger_attack()
│   ├── Dashboard Layout
│   │   ├── Verification Column
│   │   ├── Scoring Column
│   │   ├── Active Session Column
│   │   └── Blocked Column
│   └── Sidebar Controls
│
└── requirements.txt        # Dependencies
    ├── streamlit
    ├── requests
    ├── pandas
    └── streamlit-autorefresh
```

---

## 🔄 Data Flow

### Node Creation Flow
```
1. POST /api/nodes
   ↓
2. NodeController.createNode()
   ↓
3. NodeService.createNode()
   ↓
4. NodeFactory.createNode()
   ↓
5. DbService.addNode()
   ↓
6. AuditLogger.log()
   ↓
7. Return Node
```

### Trust Calculation Flow
```
1. POST /api/trust/calculate
   ↓
2. TrustController.calculateTrust()
   ↓
3. TrustService.calculateTrust()
   ↓
4. TrustScoreCalculator.calculateTrustScore()
   ├─ calculateAuthScore()
   ├─ calculateHealthScore()
   ├─ calculateBehaviorScore()
   └─ calculateNetworkScore()
   ↓
5. determineAccessLevel()
   ↓
6. DbService.updateNode()
   ↓
7. AuditLogger.log()
   ↓
8. Return Updated Node
```

### Attack Simulation Flow
```
1. POST /api/trust/simulate-attack
   ↓
2. TrustController.simulateAttack()
   ↓
3. TrustService.simulateAttack()
   ├─ Add malicious patterns
   ├─ Update behavior metrics
   ├─ Drop trust score
   └─ blockNode()
       ├─ Update status
       ├─ enforceFirewallBlock()
       │   ├─ Demo: Log command
       │   └─ Prod: Execute iptables/netsh
       └─ AuditLogger.log()
   ↓
4. Return Blocked Node
```

---

## 🗂️ File Dependencies

### Core Dependencies
```
Node.ts
  └─ Used by:
      ├─ All services
      ├─ All controllers
      ├─ All utilities
      └─ Database

systemConfig.ts
  └─ Used by:
      ├─ trustImpl.ts
      ├─ healthCheckImpl.ts
      ├─ authImpl.ts
      └─ dbImpl.ts

trustCalculator.ts
  └─ Used by:
      └─ trustImpl.ts

nodeHelpers.ts
  └─ Used by:
      ├─ nodeImpl.ts
      ├─ trustImpl.ts
      ├─ authImpl.ts
      ├─ healthCheckImpl.ts
      └─ dbImpl.ts
```

---

## 📊 Service Layer Architecture

```
┌─────────────────────────────────────────┐
│           API Layer                     │
│  (Controllers + Routes)                 │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│        Business Logic Layer             │
│  (Services - Interfaces)                │
│  ├─ INodeService                        │
│  ├─ ITrustService                       │
│  ├─ IAuthService                        │
│  ├─ IHealthCheckService                 │
│  └─ IDbService                          │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│      Implementation Layer               │
│  (Services/Impl)                        │
│  ├─ NodeImpl                            │
│  ├─ TrustImpl                           │
│  ├─ AuthImpl                            │
│  ├─ HealthCheckImpl                     │
│  └─ DbImpl                              │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Utility Layer                   │
│  ├─ TrustScoreCalculator                │
│  ├─ AnomalyDetector                     │
│  ├─ NodeFactory                         │
│  ├─ AuditLogger                         │
│  └─ IPUtils                             │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│          Data Layer                     │
│  (In-memory / Database)                 │
└─────────────────────────────────────────┘
```

---

## 🎯 Key Design Patterns

### 1. **Dependency Injection**
```typescript
// Services depend on interfaces, not implementations
class TrustImpl implements ITrustService {
    constructor(private dbService: IDbService) {}
}
```

### 2. **Factory Pattern**
```typescript
// NodeFactory creates nodes with proper initialization
NodeFactory.createNode(ip, deviceInfo);
NodeFactory.createDemoNode('healthy');
```

### 3. **Singleton Pattern**
```typescript
// Single instance of each service
const dbService = new DbImpl();
const trustService = new TrustImpl(dbService);
```

### 4. **Strategy Pattern**
```typescript
// Different behavior based on mode
if (isDemoMode()) {
    // Mock behavior
} else {
    // Real behavior
}
```

---

## 📝 Configuration Files

```
backend/
├── package.json            # Node.js dependencies
│   ├── express
│   ├── cors
│   ├── uuid
│   ├── typescript
│   ├── ts-node
│   └── nodemon
│
└── tsconfig.json           # TypeScript settings
    ├── target: ES2020
    ├── module: commonjs
    └── strict: true

frontend/
└── requirements.txt        # Python dependencies
    ├── streamlit
    ├── requests
    ├── pandas
    └── streamlit-autorefresh
```

---

## 🚀 Startup Sequence

1. **Load Configuration** (`systemConfig.ts`)
2. **Initialize Database** (`DbImpl`)
   - Create demo nodes if in demo mode
3. **Initialize Services** (`NodeImpl`, `TrustImpl`, etc.)
4. **Initialize Controllers** (`NodeController`, `TrustController`)
5. **Register Routes** (`/api/nodes`, `/api/trust`, etc.)
6. **Start Server** (Port 3000)
7. **Start Background Tasks**
   - Trust monitoring
   - Token cleanup

---

**This structure ensures:**
- ✅ Clean separation of concerns
- ✅ Easy to test
- ✅ Easy to extend
- ✅ Production-ready
- ✅ Maintainable

