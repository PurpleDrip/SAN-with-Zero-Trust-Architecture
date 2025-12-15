# 🚀 Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Start the Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
🛡️  Zero Trust SAN - Starting...
================================================
🎭 Initializing demo data...
✅ Created 3 demo nodes
🛡️  Zero Trust Controller running on http://localhost:3000
📊 Mode: DEMO
🔥 Firewall Enforcement: DISABLED
================================================
✅ Background tasks started
```

### Step 2: Start the Frontend Dashboard
Open a new terminal:
```bash
cd frontend
streamlit run app.py
```

Dashboard will open at: `http://localhost:8501`

### Step 3: Explore the Dashboard

You'll see 4 columns representing the Zero Trust pipeline:

1. **🟡 Verification** - Nodes awaiting authentication
2. **🔵 Trust Scoring** - Nodes being analyzed
3. **🟢 Active Sessions** - Approved nodes with trust scores
4. **🔴 Blocked** - Nodes that violated policies

### Step 4: Test the System

#### Create a New Node
In the sidebar:
1. Enter an IP address (e.g., `192.168.1.100`)
2. Click "Simulate New Connection Request"
3. Watch it appear in the Verification column

#### Simulate an Attack
1. Find a node in the "Active Sessions" column
2. Click the "🔥 Simulate Ransomware" button
3. Watch the node move to "Blocked" column
4. Trust score drops to ~20

### Step 5: Check the API

Open your browser or use curl:

**Get all nodes:**
```bash
curl http://localhost:3000/api/nodes
```

**Check system health:**
```bash
curl http://localhost:3000/api/health
```

**Get configuration:**
```bash
curl http://localhost:3000/api/config
```

## 🎮 Try These Scenarios

### Scenario 1: Normal Operation
1. Create a node
2. It starts in "Verification" stage
3. Trust score is calculated
4. If score > 70, moves to "Active Session"

### Scenario 2: Attack Detection
1. Click "Simulate Ransomware" on an active node
2. System detects malicious behavior
3. Trust score drops immediately
4. Node is blocked
5. Firewall rule is logged (demo mode)

### Scenario 3: Mode Switching
Switch to production mode:
```bash
curl -X POST http://localhost:3000/api/config/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "production"}'
```

⚠️ **Warning**: Production mode will actually modify firewall rules!

## 📊 Understanding Trust Scores

| Score | Access Level | What It Means |
|-------|-------------|---------------|
| 90-100 | Full | Healthy device, all checks passed |
| 70-89 | Limited | Minor issues, read-only access |
| 50-69 | Restricted | Security concerns, limited files |
| 0-49 | Blocked | Failed checks or malicious behavior |

## 🔍 What's Happening Behind the Scenes

### When You Create a Node:
1. ✅ Node is created with default trust score (50)
2. ✅ Device fingerprint is recorded
3. ✅ Initial health metrics are set
4. ✅ Audit log entry is created
5. ✅ Node enters "Verification" stage

### When You Simulate an Attack:
1. 🔥 100 malicious file access patterns are added
2. 🔥 Behavioral score drops to 0
3. 🔥 Trust score recalculated (drops to ~20)
4. 🔥 Node status changed to "blocked"
5. 🔥 Firewall block command is logged/executed
6. 🔥 Audit log records the incident

### Background Tasks (Every Minute):
- ✅ All active nodes are monitored
- ✅ Behavioral analysis runs
- ✅ Anomalies are detected
- ✅ Trust scores are updated

## 🎯 Next Steps

1. **Explore the Code**: Check out the trust calculation in `backend/utils/trustCalculator.ts`
2. **Customize**: Modify trust thresholds in `backend/config/systemConfig.ts`
3. **Add Features**: Implement your own anomaly detection rules
4. **Go Production**: Switch to production mode and test with real devices

## 🐛 Troubleshooting

**Backend won't start:**
- Make sure you ran `npm install` in the backend folder
- Check if port 3000 is already in use

**Frontend won't start:**
- Install dependencies: `pip install -r requirements.txt`
- Make sure backend is running first

**No demo nodes showing:**
- Check that system is in demo mode
- Restart the backend server

**Firewall commands not working (Production):**
- Ensure you have sudo/admin privileges
- Check your OS (Linux/Windows)
- Review firewall logs

## 📚 Learn More

- Read the full [README.md](README.md) for detailed documentation
- Check API endpoints in the README
- Explore the code structure

---

**Enjoy your Zero Trust SAN! 🛡️**
