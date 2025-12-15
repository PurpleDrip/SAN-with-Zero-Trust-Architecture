import streamlit as st
import requests
import pandas as pd
import time
from streamlit_autorefresh import st_autorefresh

# ==========================================
# 1. CONFIGURATION
# ==========================================
# The address of your Node.js Backend
API_URL = "http://localhost:3000/api"

st.set_page_config(
    page_title="Zero Trust SAN Controller",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==========================================
# 2. AUTO-REFRESH LOGIC
# ==========================================
# This acts like a "Heartbeat". It refreshes the page every 2 seconds
# to fetch the latest data from the backend without manual reloading.
count = st_autorefresh(interval=2000, key="fccounter")

# ==========================================
# 3. BACKEND COMMUNICATION
# ==========================================
def fetch_nodes():
    """Fetches the list of nodes from the Express Backend."""
    try:
        response = requests.get(f"{API_URL}/nodes")
        if response.status_code == 200:
            return response.json()
        else:
            st.error("Failed to fetch data from backend.")
            return []
    except requests.exceptions.ConnectionError:
        st.error("❌ Cannot connect to Backend! Is 'npm run dev' running?")
        return []

def trigger_attack(node_id):
    """Sends a signal to the backend to simulate an attack on a specific node."""
    try:
        url = f"{API_URL}/trust/simulate-attack"
        payload = {"nodeId": node_id}
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            st.toast(f"⚠️ Attack Triggered on {node_id}! Isolation protocol initiated.", icon="🔥")
        else:
            st.error(f"Failed to trigger attack: {response.text}")
    except Exception as e:
        st.error(f"Error: {e}")

# ==========================================
# 4. DASHBOARD UI LAYOUT
# ==========================================
st.title("🛡️ Zero Trust Architecture - SAN Controller")
st.markdown("### Real-Time Trust Monitoring & Enforcement")
st.divider()

# Fetch latest data
nodes = fetch_nodes()

# Create 4 columns for the Pipeline View
col1, col2, col3, col4 = st.columns(4)

# Helper to filter nodes by stage
def get_nodes_by_stage(stage_name):
    return [n for n in nodes if n.get('stage') == stage_name]

# --- COLUMN 1: VERIFICATION (Pending) ---
with col1:
    st.subheader("🟡 Verification")
    st.caption("Awaiting MFA & Device Health Check")
    
    pending_nodes = get_nodes_by_stage("Verification")
    if not pending_nodes:
        st.info("No pending requests")
        
    for node in pending_nodes:
        with st.container(border=True):
            st.markdown(f"**ID:** `{node['id'][:8]}...`") # Show short ID
            st.text(f"IP: {node['ip']}")
            st.warning("Status: Authenticating...")

# --- COLUMN 2: SCORING (Analysis) ---
with col2:
    st.subheader("🔵 Trust Scoring")
    st.caption("Calculating Entropy & Risk")
    
    scoring_nodes = get_nodes_by_stage("Scoring")
    if not scoring_nodes:
        st.info("Queue empty")

    for node in scoring_nodes:
        with st.container(border=True):
            st.markdown(f"**ID:** `{node['id'][:8]}...`")
            st.progress(50, text="Analyzing Behavior...")

# --- COLUMN 3: ACTIVE SESSION (Approved) ---
with col3:
    st.subheader("🟢 Active Sessions")
    st.caption("Encrypted Tunnel Established")
    
    active_nodes = get_nodes_by_stage("Active Session")
    
    for node in active_nodes:
        with st.container(border=True):
            col_a, col_b = st.columns([3, 1])
            with col_a:
                st.markdown(f"**IP:** `{node['ip']}`")
            with col_b:
                st.markdown("🔒 *TLS*")
            
            # Trust Score Metric
            st.metric(
                label="Trust Score", 
                value=f"{node['trustScore']}/100", 
                delta="Stable" if node['trustScore'] > 80 else "- Risk Detected"
            )
            
            # ATTACK BUTTON
            if st.button("🔥 Simulate Ransomware", key=f"btn_{node['id']}", use_container_width=True):
                trigger_attack(node['id'])

# --- COLUMN 4: BLOCKED (Rejected) ---
with col4:
    st.subheader("🔴 Blocked / Revoked")
    st.caption("Firewall Rules Deleted")
    
    blocked_nodes = get_nodes_by_stage("Blocked")
    
    for node in blocked_nodes:
        with st.container(border=True):
            st.error(f"Node: {node['ip']}")
            st.markdown(f"**Final Score:** {node['trustScore']}")
            st.markdown("reason: **Policy Violation**")
            st.code(f"DROP input {node['ip']}", language="bash")

# ==========================================
# 5. SIDEBAR CONTROLS - ENHANCED NODE CREATION
# ==========================================
with st.sidebar:
    st.header("🎛️ Control Panel")
    st.markdown("### Create Custom Node")
    st.caption("Configure all parameters for realistic simulation")
    
    # Create tabs for different configuration sections
    tab1, tab2, tab3 = st.tabs(["🔧 Basic", "🏥 Health", "🔐 Security"])
    
    # ==========================================
    # TAB 1: BASIC INFORMATION
    # ==========================================
    with tab1:
        st.subheader("Network & Device Info")
        
        new_ip = st.text_input("IP Address", "192.168.1.10", help="Device IP address")
        
        st.markdown("**Device Fingerprint**")
        os_type = st.selectbox("Operating System", ["Linux", "Windows", "macOS", "Android", "iOS", "unknown"])
        os_version = st.text_input("OS Version", "Ubuntu 22.04" if os_type == "Linux" else "11" if os_type == "Windows" else "13.0")
        device_type = st.selectbox("Device Type", ["server", "desktop", "laptop", "mobile", "unknown"])
        hostname = st.text_input("Hostname", f"{device_type}-{pd.Timestamp.now().strftime('%H%M')}")
        mac_address = st.text_input("MAC Address (optional)", "00:1B:44:11:3A:B7")
        
        st.markdown("**Network Security**")
        threat_level = st.select_slider(
            "Threat Level",
            options=["none", "low", "medium", "high", "critical"],
            value="none",
            help="Simulated threat intelligence level"
        )
        is_blacklisted = st.checkbox("Blacklisted IP", value=False, help="Mark as known malicious IP")
    
    # ==========================================
    # TAB 2: HEALTH METRICS
    # ==========================================
    with tab2:
        st.subheader("Device Health & Security")
        
        st.markdown("**Security Software**")
        antivirus_active = st.checkbox("Antivirus Active", value=True)
        antivirus_updated = st.checkbox("Antivirus Updated", value=True, disabled=not antivirus_active)
        
        st.markdown("**System Security**")
        firewall_enabled = st.checkbox("Firewall Enabled", value=True)
        os_patched = st.checkbox("OS Fully Patched", value=True)
        disk_encrypted = st.checkbox("Disk Encrypted", value=False)
        
        st.markdown("**Behavioral Simulation**")
        files_accessed = st.slider("Files Accessed (last hour)", 0, 200, 10, help="Number of files accessed")
        data_transferred = st.slider("Data Transferred (MB)", 0, 1000, 50, help="Data transferred in last hour")
        failed_auth = st.number_input("Failed Auth Attempts", 0, 20, 0, help="Recent failed login attempts")
    
    # ==========================================
    # TAB 3: AUTHENTICATION & SECURITY
    # ==========================================
    with tab3:
        st.subheader("Authentication Settings")
        
        st.markdown("**Authentication**")
        has_credentials = st.checkbox("Configure Authentication", value=False)
        
        username = ""
        password = ""
        mfa_enabled = False
        has_certificate = False
        
        if has_credentials:
            username = st.text_input("Username", "admin")
            password = st.text_input("Password", "password123", type="password")
            mfa_enabled = st.checkbox("MFA Enabled", value=False, help="Multi-factor authentication")
            has_certificate = st.checkbox("Has Valid Certificate", value=False, help="TLS client certificate")
        
        st.markdown("**Access Simulation**")
        simulate_suspicious = st.checkbox("Simulate Suspicious Activity", value=False)
        
        suspicious_activities = []
        if simulate_suspicious:
            activity_type = st.multiselect(
                "Suspicious Activities",
                ["Unusual access pattern detected", "Off-hours activity", "Excessive file modifications", "Port scanning detected"],
                default=[]
            )
            suspicious_activities = activity_type
    
    # ==========================================
    # CREATE NODE BUTTON
    # ==========================================
    st.divider()
    
    col_a, col_b = st.columns(2)
    with col_a:
        create_mode = st.radio("Create Mode", ["Custom", "Quick Preset"], horizontal=True)
    
    if create_mode == "Quick Preset":
        with col_b:
            preset = st.selectbox("Preset", ["Healthy", "Suspicious", "Compromised"])
        
        if st.button("🚀 Create Preset Node", use_container_width=True, type="primary"):
            try:
                # Use backend's demo node creation
                res = requests.post(f"{API_URL}/nodes", json={
                    "ip": new_ip,
                    "preset": preset.lower()
                })
                if res.status_code == 201:
                    st.success(f"✅ {preset} node created!")
                    time.sleep(0.5)
                    st.rerun()
                else:
                    st.error(f"Failed: {res.text}")
            except Exception as e:
                st.error(f"Backend offline: {e}")
    else:
        if st.button("🎯 Create Custom Node", use_container_width=True, type="primary"):
            try:
                # Build comprehensive node data
                node_data = {
                    "ip": new_ip,
                    "deviceInfo": {
                        "osType": os_type,
                        "osVersion": os_version,
                        "deviceType": device_type,
                        "hostname": hostname,
                        "macAddress": mac_address if mac_address else None
                    },
                    "healthMetrics": {
                        "antivirusActive": antivirus_active,
                        "antivirusUpdated": antivirus_updated if antivirus_active else False,
                        "firewallEnabled": firewall_enabled,
                        "osPatched": os_patched,
                        "diskEncrypted": disk_encrypted
                    },
                    "networkInfo": {
                        "threatLevel": threat_level,
                        "isBlacklisted": is_blacklisted
                    },
                    "behaviorMetrics": {
                        "filesAccessed": files_accessed,
                        "dataTransferred": data_transferred,
                        "failedAuthAttempts": failed_auth,
                        "suspiciousActivities": suspicious_activities
                    }
                }
                
                # Add auth credentials if configured
                if has_credentials:
                    node_data["authCredentials"] = {
                        "username": username,
                        "password": password,
                        "mfaEnabled": mfa_enabled,
                        "hasCertificate": has_certificate
                    }
                
                res = requests.post(f"{API_URL}/nodes", json=node_data)
                
                if res.status_code == 201:
                    node = res.json()
                    st.success(f"✅ Node created: {node.get('id', 'unknown')[:8]}...")
                    
                    # Calculate trust score immediately
                    calc_res = requests.post(f"{API_URL}/trust/calculate", json={"nodeId": node['id']})
                    if calc_res.status_code == 200:
                        trust_data = calc_res.json()
                        st.info(f"🎯 Trust Score: {trust_data['node']['trustScore']}/100")
                    
                    time.sleep(0.5)
                    st.rerun()
                else:
                    st.error(f"Failed to create node: {res.text}")
            except Exception as e:
                st.error(f"Error: {e}")
    
    # ==========================================
    # SYSTEM STATUS
    # ==========================================
    st.divider()
    st.markdown("### 📊 System Status")
    
    try:
        health_res = requests.get(f"{API_URL}/health", timeout=2)
        if health_res.status_code == 200:
            health_data = health_res.json()
            st.success("Controller: **ONLINE**")
            st.success("Policy Engine: **ACTIVE**")
            
            # Get config
            config_res = requests.get(f"{API_URL}/config", timeout=2)
            if config_res.status_code == 200:
                config = config_res.json()
                mode = config.get('mode', 'unknown').upper()
                
                if mode == 'DEMO':
                    st.info(f"🎭 Mode: **{mode}**")
                else:
                    st.warning(f"🔒 Mode: **{mode}**")
                
                # Mode toggle
                if st.button("🔄 Toggle Mode", use_container_width=True):
                    new_mode = "production" if mode == "DEMO" else "demo"
                    toggle_res = requests.post(f"{API_URL}/config/mode", json={"mode": new_mode})
                    if toggle_res.status_code == 200:
                        st.success(f"Switched to {new_mode.upper()}")
                        time.sleep(0.5)
                        st.rerun()
        else:
            st.error("Controller: **OFFLINE**")
    except:
        st.error("Controller: **OFFLINE**")
    
    # Quick stats
    st.divider()
    st.markdown("### 📈 Quick Stats")
    total_nodes = len(nodes)
    active_nodes = len([n for n in nodes if n.get('status') == 'active'])
    blocked_nodes = len([n for n in nodes if n.get('status') == 'blocked'])
    
    col1, col2, col3 = st.columns(3)
    col1.metric("Total", total_nodes)
    col2.metric("Active", active_nodes)
    col3.metric("Blocked", blocked_nodes)