# 🛡️ Zero Trust Storage Area Network (SAN)

A production-ready **Storage Area Network** with **Zero Trust Architecture** that continuously verifies devices, monitors behavior, and enforces dynamic access control based on real-time trust scores.

## 🎯 Overview

This system implements the **"Never Trust, Always Verify"** principle by:
- ✅ **Authenticating** every device attempting to access data
- 🔍 **Monitoring** device health and security posture
- 📊 **Calculating** dynamic trust scores based on multiple factors
- 🚨 **Detecting** anomalies and malicious behavior
- 🔥 **Enforcing** firewall rules automatically
- 📝 **Logging** all activities for audit compliance

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         CLIENT DEVICE                   │
│  • Health metrics                       │
│  • Authentication credentials           │
│  • Behavioral data                      │
└─────────────────────────────────────────┘
                 ↓ HTTPS/TLS
┌─────────────────────────────────────────┐
│    ZERO TRUST SAN SERVER (Node.js)      │
│  ┌───────────────────────────────────┐  │
│  │  Authentication Service (JWT)     │  │
│  │  Health Check Service             │  │
│  │  Trust Scoring Engine             │  │
│  │  Behavioral Monitor               │  │
│  │  Anomaly Detector                 │  │
│  │  Access Control (Firewall)        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│    MONITORING DASHBOARD (Streamlit)     │
│  • Real-time trust scores               │
│  • Active sessions                      │
│  • Security alerts                      │
│  • Attack simulation                    │
└─────────────────────────────────────────┘
```

## 🚀 Features

### 🔐 **Authentication & Identity**
- JWT token-based authentication
- Password hashing (SHA-256)
- Device fingerprinting (MAC, hostname, OS)
- Multi-factor authentication support (configurable)

### 🏥 **Device Health Assessment**
- **Real System Checks** (Production Mode):
  - Antivirus status (ClamAV/Windows Defender)
  - Firewall enabled (ufw/iptables/Windows Firewall)
  - OS patch level
  - Disk encryption (LUKS/BitLocker)
- **Mock Checks** (Demo Mode) for visualization

### 📊 **Dynamic Trust Scoring**
Trust score (0-100) calculated from:
- **Authentication Score (25%)**: MFA, certificates, recent auth
- **Device Health Score (25%)**: AV, firewall, patches, encryption
- **Behavioral Score (30%)**: Access patterns, anomalies, violations
- **Network Reputation (20%)**: IP blacklist, threat level, geolocation

### 🚨 **Anomaly Detection**
- **Ransomware Detection**: Mass file encryption patterns
- **Data Exfiltration**: Excessive data transfer
- **Brute Force**: Multiple failed auth attempts
- **Unusual Access**: Off-hours activity, suspicious files

### 🔥 **Firewall Integration**
**Production Mode** (actually executes):
- Linux: `iptables` rules
- Windows: `netsh advfirewall` rules

**Demo Mode** (logs only):
- Simulates firewall commands without execution

### 📝 **Comprehensive Logging**
- Authentication events
- Trust score changes
- Access violations
- System events
- Audit trail with timestamps

## 🎮 Operating Modes

### 🎭 **Demo Mode** (Default)
- Perfect for **presentations** and **testing**
- Uses mock data and simulations
- **Does NOT** modify firewall rules
- Auto-generates demo nodes
- Visualizes the Zero Trust pipeline

### 🔒 **Production Mode**
- **Real security enforcement**
- Executes actual firewall commands
- Requires system permissions (sudo/admin)
- Validates real device health
- Production-ready security

**Toggle Mode:**
```bash
POST http://localhost:3000/api/config/mode
{
  "mode": "production"  # or "demo"
}
```

## 📦 Installation

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.8+ and pip
- **Linux** (recommended) or **Windows**

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
pip install -r requirements.txt
streamlit run app.py
```

## 🔧 Configuration

Edit `backend/config/systemConfig.ts`:

```typescript
export const PRODUCTION_CONFIG: SystemConfig = {
    mode: 'production',
    
    trustThresholds: {
        fullAccess: 90,      // Full access
        limitedAccess: 70,   // Read-only
        restrictedAccess: 50, // Specific files only
        blocked: 50          // No access
    },

    security: {
        enforceFirewall: true,  // Actually modify firewall
        requireMFA: true,
        requireEncryption: true
    }
};
```

## 🌐 API Endpoints

### **Nodes**
- `GET /api/nodes` - List all nodes
- `POST /api/nodes` - Create new node
- `GET /api/nodes/:id` - Get node details
- `DELETE /api/nodes/:id` - Remove node

### **Trust Management**
- `POST /api/trust/calculate` - Calculate trust score
- `POST /api/trust/monitor` - Monitor behavior
- `GET /api/trust/anomalies/:nodeId` - Detect anomalies
- `POST /api/trust/block` - Block a node
- `POST /api/trust/unblock` - Unblock a node
- `POST /api/trust/simulate-attack` - Simulate ransomware

### **System**
- `GET /api/config` - Get system configuration
- `POST /api/config/mode` - Change operating mode
- `GET /api/health` - System health check

## 📊 Trust Score Breakdown

| Component | Weight | Factors |
|-----------|--------|---------|
| **Authentication** | 25% | MFA enabled (+15), Valid certificate (+5), Recent auth (+5) |
| **Device Health** | 25% | Antivirus (+7), AV updated (+3), Firewall (+7), OS patched (+5), Encryption (+3) |
| **Behavior** | 30% | Normal patterns (+30), Suspicious activities (-5 each), Failed auth (-3 each) |
| **Network** | 20% | Not blacklisted (+15), Low threat level (+5) |

### Access Levels
- **90-100**: Full Access (read/write/execute)
- **70-89**: Limited Access (read-only)
- **50-69**: Restricted Access (specific files)
- **0-49**: Blocked (no access)

## 🎬 Usage Examples

### Create a New Node
```bash
POST http://localhost:3000/api/nodes
{
  "ip": "192.168.1.50",
  "deviceInfo": {
    "osType": "Linux",
    "osVersion": "Ubuntu 22.04",
    "deviceType": "server",
    "hostname": "web-server-01",
    "macAddress": "00:1B:44:11:3A:B7"
  }
}
```

### Calculate Trust Score
```bash
POST http://localhost:3000/api/trust/calculate
{
  "nodeId": "abc-123-def-456"
}
```

### Simulate Attack
```bash
POST http://localhost:3000/api/trust/simulate-attack
{
  "nodeId": "abc-123-def-456"
}
```

## 🔒 Security Considerations

### Production Deployment
1. **Change JWT Secret**: Update `SECRET_KEY` in `authImpl.ts`
2. **Use HTTPS**: Enable TLS/SSL certificates
3. **Firewall Permissions**: Ensure server has sudo/admin rights
4. **Database**: Replace in-memory DB with PostgreSQL/MongoDB
5. **Rate Limiting**: Add rate limiting middleware
6. **Input Validation**: Validate all inputs
7. **Logging**: Use proper logging framework (Winston)

### Firewall Commands (Production)
**Linux:**
```bash
# Block IP
sudo iptables -A INPUT -s 192.168.1.50 -j DROP

# Allow IP
sudo iptables -A INPUT -s 192.168.1.50 -j ACCEPT
```

**Windows:**
```powershell
# Block IP
netsh advfirewall firewall add rule name="Block_192.168.1.50" dir=in action=block remoteip=192.168.1.50

# Allow IP
netsh advfirewall firewall add rule name="Allow_192.168.1.50" dir=in action=allow remoteip=192.168.1.50
```

## 📈 Monitoring Dashboard

Access the Streamlit dashboard at `http://localhost:8501`

**Features:**
- Real-time trust score visualization
- Node pipeline (Verification → Scoring → Active → Blocked)
- Attack simulation buttons
- System status indicators
- Auto-refresh every 2 seconds

## 🧪 Testing

### Demo Mode Testing
1. Start backend: `npm run dev`
2. Start frontend: `streamlit run app.py`
3. Create nodes via sidebar
4. Simulate attacks
5. Watch trust scores change

### Production Mode Testing
1. Switch to production mode
2. Create a node from your actual IP
3. System will check real device health
4. Trust score reflects actual security posture

## 🛠️ Development

### Project Structure
```
backend/
├── config/          # System configuration
├── controllers/     # API controllers
├── models/          # Data models
├── routes/          # API routes
├── services/        # Business logic
│   └── Impl/        # Service implementations
├── utils/           # Helper functions
└── index.ts         # Main server file

frontend/
└── app.py           # Streamlit dashboard
```

### Adding New Features
1. Define interface in `services/`
2. Implement in `services/Impl/`
3. Create controller in `controllers/`
4. Add routes in `routes/`
5. Update `index.ts` to wire everything

## 📝 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

## 📞 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ using Node.js, TypeScript, Express, and Streamlit**
