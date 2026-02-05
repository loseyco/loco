
const processListEl = document.getElementById('process-list');
const scriptListEl = document.getElementById('script-list');

async function update() {
    // 1. Processes
    const status = await window.api.getStatus();
    if (status.processes) {
        processListEl.innerHTML = '';
        if (status.processes.length === 0) {
            processListEl.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #666;">
                    <div style="font-size: 2em; margin-bottom: 10px;">👻</div>
                    <div style="font-weight: bold; margin-bottom: 5px;">Fleet Destroyed</div>
                    <div style="font-size: 0.8em;">System is cold. Click <span style="color: #2ecc71;">START SYSTEM</span> to reboot using ecosystem.json</div>
                </div>
            `;
        }
        status.processes.forEach(proc => {
            const row = document.createElement('div');
            // Simplified row style
            row.style.cssText = `
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: 10px; 
                background: #111; 
                margin-bottom: 6px; 
                border-radius: 4px; 
                border-left: 3px solid ${proc.status === 'online' ? '#2ecc71' : '#555'};
            `;

            row.innerHTML = `
                <div style="display:flex; flex-direction:column;">
                    <span style="font-size:0.8em; font-weight:bold; color:#ddd;">${proc.name}</span>
                    <span style="font-size:0.65em; color:#666;">uptime: ${formatUptime(proc.uptime)}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px;">
                    <!-- Auto-Boot Checkbox -->
                    <label style="cursor: pointer; display: flex; align-items: center;" title="Auto-start on System Boot">
                        <input type="checkbox" 
                            ${proc.prefBoot ? 'checked' : ''} 
                            onchange="updatePref('${proc.name}', 'boot', this.checked)">
                    </label>

                    <!-- Restart-Crash Checkbox -->
                    <label style="cursor: pointer; display: flex; align-items: center;" title="Auto-restart on Crash">
                        <input type="checkbox" 
                            ${proc.prefCrash ? 'checked' : ''} 
                            onchange="updatePref('${proc.name}', 'crash', this.checked)">
                    </label>

                    <!-- Main Toggle -->
                    <button class="btn-toggle" onclick="toggle('${proc.name}', ${proc.status !== 'online'})" 
                        style="${proc.status === 'online' ? 'background:#3d0e0e; color:#e74c3c; border-color:#521414' : 'background:#0e1f14; color:#2ecc71; border-color:#16301f'}">
                        ${proc.status === 'online' ? 'STOP' : 'START'}
                    </button>
                </div>
            `;
            processListEl.appendChild(row);
        });
    }

    function formatUptime(ms) {
        if (!ms) return '0s';
        const s = Math.floor((Date.now() - ms) / 1000);
        if (s < 0) return '0s';
        if (s < 60) return s + 's';
        if (s < 3600) return Math.floor(s / 60) + 'm';
        return Math.floor(s / 3600) + 'h';
    }

    // 2. Scripts (Load once if empty or different count)
    // For simplicity, we just check if empty
    if (scriptListEl.innerHTML.includes('Scanning')) {
        const scripts = await window.api.getScripts();
        scriptListEl.innerHTML = '';
        if (scripts.length === 0) {
            scriptListEl.innerHTML = '<div style="color:#444; font-size:0.7em; padding:10px;">No utility scripts found</div>';
        } else {
            // Group by type
            const grouped = {};
            scripts.forEach(s => {
                if (!grouped[s.type]) grouped[s.type] = [];
                grouped[s.type].push(s);
            });

            // Sort Utils first, then Cron, then Infra
            const order = ['utils', 'cron', 'infra'];

            order.forEach(type => {
                if (grouped[type]) {
                    const groupTitle = document.createElement('div');
                    groupTitle.style.cssText = 'font-size:0.6em; color:#333; margin:10px 0 5px 5px; text-transform:uppercase; font-weight:bold;';
                    groupTitle.textContent = type;
                    scriptListEl.appendChild(groupTitle);

                    grouped[type].forEach(script => {
                        const row = document.createElement('div');
                        row.className = 'script-row';
                        row.innerHTML = `
                            <span class="script-name" title="${script.name}">${script.name}</span>
                            <button class="btn-run" onclick="runScript('${script.path.replace(/\\/g, '\\\\')}')">RUN</button>
                        `;
                        scriptListEl.appendChild(row);
                    });
                }
            });
        }
    }
}

// Actions
window.control = async (action) => {
    if (action === 'kill' && !confirm('⚠️ NUCLEAR OPTION ⚠️\n\nThis will force kill ALL OpenClaw robots and services.\n\nUse this only if systems are unresponsive.\n\nProceed?')) return;
    await window.api.controlSystem(action);
    setTimeout(update, 1000);
};

window.toggle = async (name, shouldStart) => {
    await window.api.toggleProcess(name, shouldStart);
    setTimeout(update, 1000);
};

window.runScript = async (path) => {
    // Visual feedback
    const btn = event.target;
    const oldText = btn.textContent;
    btn.textContent = '...';
    await window.api.runScript(path);
    setTimeout(() => btn.textContent = oldText, 2000);
};

window.updatePref = async (name, type, value) => {
    await window.api.updatePref(name, type, value);
    // Don't force update immediately to avoid UI jitter, allow next poll to catch it
};

// Loop
update();
setInterval(update, 2000);
