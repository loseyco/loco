
const statusEl = document.getElementById('connection-status');
const processListEl = document.getElementById('process-list');
const portsListEl = document.getElementById('ports-list');

async function updateStatus() {
    const data = await window.api.getStatus();

    if (data.error) {
        statusEl.textContent = 'ERROR';
        statusEl.style.color = '#c0392b';
        return;
    }

    statusEl.textContent = 'ONLINE';
    statusEl.style.color = '#27ae60';

    // Render Processes
    processListEl.innerHTML = '';
    data.processes.forEach(proc => {
        const row = document.createElement('div');
        row.className = 'process-row';

        const statusClass = proc.status === 'online' ? 'status-online' :
            (proc.status === 'stopped' ? 'status-stopped' : 'status-errored');

        const actionText = proc.status === 'online' ? 'Disable' : 'Enable';
        const actionColor = proc.status === 'online' ? '#e74c3c' : '#2ecc71';

        row.innerHTML = `
            <div>
                <span class="process-name">${proc.name}</span>
                <div style="font-size:0.8em; color:#95a5a6">PID: ${proc.pid}</div>
            </div>
            <div class="switch-container">
                <span class="status-badge ${statusClass}">${proc.status}</span>
                <button class="toggle-btn" 
                        onclick="toggle('${proc.name}', ${proc.status !== 'online'})"
                        style="border-color:${actionColor}; color:${actionColor}">
                    ${actionText}
                </button>
            </div>
        `;
        processListEl.appendChild(row);
    });

    // Render Ports
    if (data.ports.length > 0) {
        portsListEl.textContent = 'Active Ports: ' + data.ports.join(', ');
    } else {
        portsListEl.textContent = 'No Gateway Ports Detected';
    }
}

async function control(action) {
    if (action === 'kill') {
        if (!confirm('⚠️ NUCLEAR OPTION ⚠️\n\nThis will force kill ALL Node.js processes on the machine (except this panel).\n\nUse this if OpenClaw is stuck or broken.\n\nAre you sure?')) return;
    }

    await window.api.controlSystem(action);
    setTimeout(updateStatus, 1000); // Wait for action to take effect
}

async function toggle(name, shouldStart) {
    await window.api.toggleProcess(name, shouldStart);
    setTimeout(updateStatus, 500);
}

// Global exposure for onclick handlers
window.control = control;
window.toggle = toggle;

// Poll status every 2 seconds
updateStatus();
setInterval(updateStatus, 2000);
