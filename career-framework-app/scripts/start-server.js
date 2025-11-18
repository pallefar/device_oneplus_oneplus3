#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

// Function to get local network IP
function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const networkIP = getNetworkIP();
const port = process.env.PORT || 3000;

console.log('\n========================================');
console.log('🚀 Starting Career Framework App Server');
console.log('========================================\n');
console.log('📍 Local Access:');
console.log(`   http://localhost:${port}`);
console.log('\n🌐 Network Access (share with team):');
console.log(`   http://${networkIP}:${port}`);
console.log('\n💡 Others on your network can access using the Network URL');
console.log('========================================\n');

// Open browser after a short delay
setTimeout(() => {
  const url = `http://localhost:${port}`;
  const platform = process.platform;

  let command;
  if (platform === 'win32') {
    command = `start ${url}`;
  } else if (platform === 'darwin') {
    command = `open ${url}`;
  } else {
    command = `xdg-open ${url} || sensible-browser ${url} || x-www-browser ${url}`;
  }

  exec(command, (error) => {
    if (error) {
      console.log(`\n⚠️  Could not auto-open browser. Please navigate to: ${url}\n`);
    } else {
      console.log('✅ Opening browser...\n');
    }
  });
}, 3000);

// Start the Next.js server
const server = exec('next dev -H 0.0.0.0', { cwd: __dirname + '/..' });

server.stdout.on('data', (data) => {
  process.stdout.write(data);
});

server.stderr.on('data', (data) => {
  process.stderr.write(data);
});

server.on('exit', (code) => {
  process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...\n');
  server.kill();
  process.exit();
});
