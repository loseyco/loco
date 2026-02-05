const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const startupPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup', 'OC-STARTUP.lnk');
const targetPath = 'C:\\LoCoOS\\scripts\\startup.bat';

const psScript = `
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('${startupPath}')
$Shortcut.TargetPath = '${targetPath}'
$Shortcut.WorkingDirectory = 'C:\\LoCoOS'
$Shortcut.WindowStyle = 7
$Shortcut.Save()
`;

const encodedScript = Buffer.from(psScript, 'utf16le').toString('base64');

try {
    execSync(`powershell -EncodedCommand ${encodedScript}`);
    console.log('Startup shortcut created.');
} catch (err) {
    console.error('Error creating shortcut:', err);
}
