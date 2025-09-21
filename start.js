#!/usr/bin/env node

const path = require('path');
const { createServer } = require('http');
const next = require('next');

// Determine runtime settings from Railway env vars
const port = parseInt(process.env.PORT, 10) || 8080;
const host = process.env.HOST || '0.0.0.0';

// Initialize Next.js in production mode using the standalone build
const app = next({
  dev: false,
  dir: path.join(__dirname, '.next', 'standalone'),
  hostname: host,
  port,
});
const handle = app.getRequestHandler();

// Prepare and start listening
app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, host, (err) => {
    if (err) throw err;
    console.log(`> Server listening on http://${host}:${port}`);
  });
});
