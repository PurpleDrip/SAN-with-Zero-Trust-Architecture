import streamlit as st
import time
import random

# 1. Setup the Page
st.set_page_config(layout="wide")
st.title("Zero Trust SAN Controller")

# 2. Define the Layout (The 4 Stages)
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.header("🟡 Verification")
    # Show nodes waiting for MFA
    st.info("Node-A (Requesting Access...)")

with col2:
    st.header("🔵 Trust Scoring")
    # Show nodes being analyzed
    if st.button("Analyze Node-A"):
        st.write("Checking Entropy...")
        st.write("Checking OS Patch...")
        
with col3:
    st.header("🟢 Active Session")
    # Show approved nodes with a "Kill" button
    st.success("Node-B (192.168.1.5)")
    st.metric(label="Current Trust Score", value="92", delta="-2")
    if st.button("REVOKE ACCESS", key="revoke_b"):
        # Python calls Linux command here
        # subprocess.run(["iptables", "-D", ...])
        st.error("Connection Severed!")

with col4:
    st.header("🔴 Blocked")
    st.error("Node-C (Ransomware Detected)")