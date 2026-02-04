const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const startupPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup', 'OC-WATCHDOG.lnk');
const psScriptPath = 'C:\\LoCoOS\\scripts\\watchdog.ps1';

// PowerShell command to launch the script hidden/minimized
const psCommand = `
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('${startupPath}')
$Shortcut.TargetPath = 'powershell.exe'
$Shortcut.Arguments = '-WindowStyle Hidden -File "${psScriptPath}"'
$Shortcut.WorkingDirectory = 'C:\\LoCoOS'
$Shortcut.WindowStyle = 7
$Shortcut.Save()
`;

const encodedScript = Buffer.from(psCommand, 'utf16le').toString('base64');

try {
    execSync(`powershell -EncodedCommand ${encodedScript}`);
    console.log('Immortal Watchdog shortcut created in Startup folder.');
} catch (err) {
    console.error('Error creating watchdog shortcut:', err);
}
