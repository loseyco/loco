
const ws = require('windows-shortcuts');
const path = require('path');
const fs = require('fs');

const targetApp = path.join('C:', 'LoCoOS', 'gui');
const iconPath = path.join('C:', 'LoCoOS', 'gui', 'icon.ico'); // (Optional, we don't have one yet)
const startupFolder = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
const desktopPath = path.join(process.env.USERPROFILE, 'Desktop');

const shortcutConfig = {
    target: 'C:\\Program Files\\nodejs\\npx.cmd', // Uses NPX to run electron
    args: 'electron .',
    cwd: targetApp,
    desc: 'LoCo Mission Control',
    icon: 'shell32.dll,3' // Generic application icon
};

// 1. Create Startup Shortcut
ws.create(path.join(startupFolder, 'LoCo-Control.lnk'), shortcutConfig, (err) => {
    if (err) console.error('Startup Shortcut Error:', err);
    else console.log('Startup Shortcut properties set.');
});

// 2. Create Desktop Shortcut
ws.create(path.join(desktopPath, 'LoCo-Control.lnk'), shortcutConfig, (err) => {
    if (err) console.error('Desktop Shortcut Error:', err);
    else console.log('Desktop Shortcut properties set.');
});
