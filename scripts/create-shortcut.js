const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const desktopPath = path.join(os.homedir(), 'Desktop', 'OC-RECOVERY.lnk');
const targetPath = 'C:\\LoCoOS\\scripts\\recovery.bat';

const psScript = `
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('${desktopPath}')
$Shortcut.TargetPath = '${targetPath}'
$Shortcut.WorkingDirectory = 'C:\\LoCoOS'
$Shortcut.IconLocation = 'C:\\WINDOWS\\System32\\shell32.dll,238'
$Shortcut.Save()
`;

const encodedScript = Buffer.from(psScript, 'utf16le').toString('base64');

try {
    execSync(`powershell -EncodedCommand ${encodedScript}`);
    console.log('Shortcut created on Desktop.');
} catch (err) {
    console.error('Error creating shortcut:', err);
}
