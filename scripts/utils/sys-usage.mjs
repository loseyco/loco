import os from 'os';

const usage = {
    freeMem: os.freemem(),
    totalMem: os.totalmem(),
    cpus: os.cpus().length,
    load: os.loadavg(),
    uptime: os.uptime()
};

console.log(JSON.stringify(usage, null, 2));
