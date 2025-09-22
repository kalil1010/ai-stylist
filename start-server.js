#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Railway assigns PORT; default back to 8080 for local dev
const port = process.env.PORT || 8080;
const host = '0.0.0.0';

process.env.PORT = port;
process.env.HOSTNAME = host;

const standaloneDir = path.join(__dirname, '.next', 'standalone');
const serverScript = path.join(standaloneDir, 'server.js');

console.log(`Starting standalone server on http://${host}:${port}`);

const child = spawn('node', [serverScript], {
  cwd: standaloneDir,
  stdio: 'inherit',
  env: process.env
});

child.on('exit', code => process.exit(code));

