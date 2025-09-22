const { spawn } = require('child_process');
const path = require('path');

// Get Railway's dynamic port, fallback to 8080
const port = process.env.PORT || 8080;

// Set environment variables for the standalone server
process.env.PORT = port;
process.env.HOSTNAME = '0.0.0.0';

// Start the standalone server in its directory
const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');
const child = spawn('node', [serverPath], {
  cwd: path.join(__dirname, '.next', 'standalone'),
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port,
    HOSTNAME: '0.0.0.0'
  }
});

console.log(`Starting server on 0.0.0.0:${port}`);

child.on('exit', (code) => {
  process.exit(code);
});
