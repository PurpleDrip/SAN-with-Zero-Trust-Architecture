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
# 5. SIDEBAR CONTROLS
# ==========================================
with st.sidebar:
    st.header("Control Panel")
    st.write("Use this panel to inject nodes into the system manually for testing.")
    
    new_ip = st.text_input("New Client IP", "192.168.1.10")
    if st.button("Simulate New Connection Request"):
        try:
            res = requests.post(f"{API_URL}/nodes", json={"ip": new_ip})
            if res.status_code == 201:
                st.success("Request Sent!")
            else:
                st.error("Failed to create node")
        except:
            st.error("Backend offline")

    st.divider()
    st.markdown("### System Status")
    st.success("Controller: **ONLINE**")
    st.success("Policy Engine: **ACTIVE**")