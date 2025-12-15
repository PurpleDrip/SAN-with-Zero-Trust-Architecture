# 🎨 Enhanced Frontend Features

## What's New

The frontend dashboard now includes a **comprehensive node creation interface** that allows you to configure every aspect of a node for realistic Zero Trust simulation.

---

## 🎛️ New Control Panel Features

### **3-Tab Configuration System**

#### **Tab 1: 🔧 Basic Information**
Configure network and device details:

**Network Info:**
- ✅ IP Address (required)

**Device Fingerprint:**
- ✅ Operating System (Linux, Windows, macOS, Android, iOS)
- ✅ OS Version (e.g., "Ubuntu 22.04", "Windows 11")
- ✅ Device Type (server, desktop, laptop, mobile)
- ✅ Hostname (auto-generated or custom)
- ✅ MAC Address (optional)

**Network Security:**
- ✅ Threat Level (none, low, medium, high, critical)
- ✅ Blacklisted IP checkbox

---

#### **Tab 2: 🏥 Health Metrics**
Configure device security posture:

**Security Software:**
- ✅ Antivirus Active
- ✅ Antivirus Updated (auto-disabled if AV not active)

**System Security:**
- ✅ Firewall Enabled
- ✅ OS Fully Patched
- ✅ Disk Encrypted

**Behavioral Simulation:**
- ✅ Files Accessed (slider: 0-200)
- ✅ Data Transferred in MB (slider: 0-1000)
- ✅ Failed Auth Attempts (0-20)

---

#### **Tab 3: 🔐 Security & Authentication**
Configure authentication and suspicious activities:

**Authentication:**
- ✅ Configure Authentication (checkbox)
  - Username
  - Password (hashed automatically)
  - MFA Enabled
  - Has Valid Certificate

**Access Simulation:**
- ✅ Simulate Suspicious Activity (checkbox)
  - Unusual access pattern detected
  - Off-hours activity
  - Excessive file modifications
  - Port scanning detected

---

## 🚀 Two Creation Modes

### **Mode 1: Custom Node**
Full control over all parameters:
1. Configure all tabs with your desired settings
2. Click "🎯 Create Custom Node"
3. Backend applies all settings
4. Trust score calculated automatically
5. Node appears in appropriate pipeline stage

### **Mode 2: Quick Preset**
Fast creation with predefined scenarios:
- **Healthy**: High trust score, all security enabled
- **Suspicious**: Medium trust score, some issues
- **Compromised**: Low trust score, blocked

---

## 📊 Enhanced System Status

**Real-time Monitoring:**
- ✅ Controller status (ONLINE/OFFLINE)
- ✅ Policy Engine status
- ✅ Current mode (DEMO/PRODUCTION)
- ✅ Mode toggle button

**Quick Stats:**
- ✅ Total nodes
- ✅ Active nodes
- ✅ Blocked nodes

---

## 🎯 How Trust Score is Calculated

When you create a custom node, the backend calculates:

### **Authentication Score (25%)**
- MFA enabled: +15
- Valid certificate: +5
- Recent auth: +5

### **Device Health Score (25%)**
Based on your checkboxes:
- Antivirus active: +7
- Antivirus updated: +3
- Firewall enabled: +7
- OS patched: +5
- Disk encrypted: +3

### **Behavioral Score (30%)**
Based on your sliders:
- Starts at 30
- Suspicious activities: -5 each
- Failed auth attempts: -3 each
- Excessive file access (>50/min): -10
- Excessive data transfer (>500MB): -10

### **Network Reputation (20%)**
Based on threat level:
- Blacklisted: 0 (instant fail)
- Critical threat: -20
- High threat: -15
- Medium threat: -10
- Low threat: -5
- None: +20

---

## 💡 Example Scenarios

### **Scenario 1: Healthy Server**
```
Tab 1 (Basic):
- IP: 192.168.1.100
- OS: Linux / Ubuntu 22.04
- Device: server
- Threat Level: none
- Not blacklisted

Tab 2 (Health):
- ✅ Antivirus Active
- ✅ Antivirus Updated
- ✅ Firewall Enabled
- ✅ OS Patched
- ✅ Disk Encrypted
- Files: 10
- Data: 50 MB
- Failed Auth: 0

Tab 3 (Security):
- ✅ Configure Auth
  - Username: admin
  - Password: ********
  - ✅ MFA Enabled
  - ✅ Has Certificate
- No suspicious activity

Expected Trust Score: 95-100
Access Level: Full
```

### **Scenario 2: Suspicious Workstation**
```
Tab 1 (Basic):
- IP: 192.168.1.50
- OS: Windows / 10
- Device: desktop
- Threat Level: low
- Not blacklisted

Tab 2 (Health):
- ✅ Antivirus Active
- ❌ Antivirus Updated
- ✅ Firewall Enabled
- ❌ OS Patched
- ❌ Disk Encrypted
- Files: 150 (high)
- Data: 200 MB
- Failed Auth: 2

Tab 3 (Security):
- No auth configured
- ✅ Suspicious Activity
  - Unusual access pattern

Expected Trust Score: 55-65
Access Level: Restricted
```

### **Scenario 3: Compromised Device**
```
Tab 1 (Basic):
- IP: 10.0.0.99
- OS: Windows / 7
- Device: laptop
- Threat Level: high
- ✅ Blacklisted

Tab 2 (Health):
- ❌ Antivirus Active
- ❌ Firewall Enabled
- ❌ OS Patched
- ❌ Disk Encrypted
- Files: 200 (very high)
- Data: 800 MB (very high)
- Failed Auth: 10

Tab 3 (Security):
- No auth
- ✅ Suspicious Activity
  - All activities selected

Expected Trust Score: 0-20
Access Level: Blocked
Status: Firewall rule applied
```

---

## 🎮 Interactive Features

### **Immediate Feedback**
- ✅ Trust score calculated on creation
- ✅ Node appears in correct pipeline stage
- ✅ Success/error messages
- ✅ Auto-refresh to show new node

### **Visual Pipeline**
Watch your node move through stages:
1. **Verification** (pending)
2. **Scoring** (analyzing)
3. **Active Session** (approved)
4. **Blocked** (denied)

### **Attack Simulation**
- Click "🔥 Simulate Ransomware" on any active node
- Watch trust score drop
- See node move to blocked stage
- View firewall command (demo) or execution (production)

---

## 🔄 Mode Toggle

**Switch between modes from the sidebar:**
- Click "🔄 Toggle Mode"
- Demo → Production: Real firewall enforcement
- Production → Demo: Safe simulation

**Visual Indicators:**
- 🎭 DEMO mode: Blue info box
- 🔒 PRODUCTION mode: Orange warning box

---

## 📈 Use Cases

### **Educational**
- Demonstrate Zero Trust principles
- Show how different configurations affect trust
- Visualize security posture impact

### **Testing**
- Test trust scoring algorithms
- Validate anomaly detection
- Simulate various attack scenarios

### **Development**
- Prototype security policies
- Fine-tune trust thresholds
- Debug behavioral analysis

---

## 🎯 Tips for Best Results

1. **Start Simple**: Use Quick Presets first
2. **Experiment**: Try different combinations
3. **Watch Scores**: See how each setting affects trust
4. **Simulate Attacks**: Test the blocking mechanism
5. **Toggle Modes**: Compare demo vs production behavior

---

## 🚀 What Happens Behind the Scenes

When you create a custom node:

1. **Frontend** sends comprehensive JSON to backend:
```json
{
  "ip": "192.168.1.100",
  "deviceInfo": { ... },
  "healthMetrics": { ... },
  "networkInfo": { ... },
  "behaviorMetrics": { ... },
  "authCredentials": { ... }
}
```

2. **Backend** processes the data:
   - Creates node with NodeFactory
   - Applies all custom settings
   - Hashes password (SHA-256)
   - Generates certificate ID if needed
   - Calculates health score
   - Updates database

3. **Trust Engine** calculates score:
   - Runs all 4 scoring algorithms
   - Determines access level
   - Sets node stage
   - Logs audit entry

4. **Response** sent back:
   - Full node object
   - Trust score breakdown
   - Access level
   - Stage assignment

5. **Frontend** updates:
   - Shows success message
   - Displays trust score
   - Refreshes dashboard
   - Node appears in pipeline

---

## 🎉 Summary

You can now:
- ✅ Configure every aspect of a node
- ✅ See real-time trust calculation
- ✅ Understand how each setting affects security
- ✅ Create realistic test scenarios
- ✅ Simulate various security postures
- ✅ Toggle between demo and production modes
- ✅ Monitor system status in real-time

**The frontend is now a complete Zero Trust simulation platform!** 🚀
