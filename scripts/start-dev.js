const { execSync } = require('child_process');
const path = require('path');

process.chdir(path.join(__dirname, '../site'));
console.log('Starting development server...');

try {
    execSync('npm run dev -- -p 3001 -H 0.0.0.0', { stdio: 'inherit' });
} catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
}
