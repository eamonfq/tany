const { exec } = require('child_process');
const path = require('path');

console.log('Iniciando Eventos Tany...');

const server = exec('node server/index.js', { cwd: __dirname });
const client = exec('node node_modules/vite/bin/vite.js', { cwd: path.join(__dirname, 'client') });

server.stdout.pipe(process.stdout);
server.stderr.pipe(process.stderr);
client.stdout.pipe(process.stdout);
client.stderr.pipe(process.stderr);

process.on('SIGINT', () => { server.kill(); client.kill(); process.exit(); });
server.on('close', () => { client.kill(); process.exit(); });
client.on('close', () => { server.kill(); process.exit(); });
