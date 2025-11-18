#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const os = require('os');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  port: null,
  noBrowser: false,
  production: false,
  help: false,
  localOnly: false,
};

// Parse flags
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--port' || arg === '-p') {
    flags.port = parseInt(args[++i]) || null;
  } else if (arg === '--no-browser' || arg === '-nb') {
    flags.noBrowser = true;
  } else if (arg === '--production' || arg === '-prod') {
    flags.production = true;
  } else if (arg === '--local-only' || arg === '-l') {
    flags.localOnly = true;
  } else if (arg === '--help' || arg === '-h') {
    flags.help = true;
  }
}

// Show help
if (flags.help) {
  console.log(`
Career Framework App - Server Launcher
========================================

Usage: npm run server [options]

Options:
  -p, --port <number>      Specify port (default: 3000)
  -nb, --no-browser        Don't auto-open browser
  -prod, --production      Run in production mode
  -l, --local-only         Bind to localhost only (no network access)
  -h, --help               Show this help message

Examples:
  npm run server                    Start with defaults
  npm run server -- -p 8080         Start on port 8080
  npm run server -- --no-browser    Start without opening browser
  npm run server -- --local-only    Local access only
  npm run server -- -p 8080 -nb     Port 8080, no browser

Interactive Mode:
  Run without arguments for interactive setup

Environment Variables:
  PORT=<number>                     Set default port
  NO_BROWSER=true                   Disable auto-open browser
`);
  process.exit(0);
}

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

// Interactive prompt
async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
}

async function interactiveSetup() {
  console.log('\n========================================');
  console.log('🚀 Career Framework App Setup');
  console.log('========================================\n');

  // Ask for port
  const portAnswer = await askQuestion(`Enter port number (default: 3000): `);
  const port = parseInt(portAnswer) || 3000;

  // Ask about browser
  const browserAnswer = await askQuestion(`Auto-open browser? (Y/n): `);
  const openBrowser = !browserAnswer || browserAnswer.toLowerCase() !== 'n';

  // Ask about network access
  const networkAnswer = await askQuestion(`Enable network access for team? (Y/n): `);
  const networkAccess = !networkAnswer || networkAnswer.toLowerCase() !== 'n';

  // Ask about mode
  const modeAnswer = await askQuestion(`Run in production mode? (y/N): `);
  const production = modeAnswer && modeAnswer.toLowerCase() === 'y';

  console.log('\n');

  return {
    port,
    openBrowser,
    networkAccess,
    production,
  };
}

async function main() {
  let config;

  // If no flags provided and not in CI environment, use interactive mode
  if (args.length === 0 && !process.env.CI && process.stdin.isTTY) {
    config = await interactiveSetup();
  } else {
    // Use flags/defaults
    config = {
      port: flags.port || parseInt(process.env.PORT) || 3000,
      openBrowser: !flags.noBrowser && process.env.NO_BROWSER !== 'true',
      networkAccess: !flags.localOnly,
      production: flags.production,
    };
  }

  const networkIP = getNetworkIP();
  const { port, openBrowser, networkAccess, production } = config;

  console.log('========================================');
  console.log('🚀 Starting Career Framework App Server');
  console.log('========================================\n');
  console.log(`📦 Mode: ${production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`🔌 Port: ${port}`);
  console.log(`🌐 Network Access: ${networkAccess ? 'ENABLED' : 'DISABLED'}\n`);

  console.log('📍 Access URLs:');
  console.log(`   Local:   http://localhost:${port}`);

  if (networkAccess) {
    console.log(`   Network: http://${networkIP}:${port}`);
    console.log('\n💡 Share the Network URL with your team!');
  }

  console.log('========================================\n');

  // Open browser after a short delay
  if (openBrowser) {
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
          console.log(`⚠️  Could not auto-open browser. Please navigate to: ${url}\n`);
        } else {
          console.log('✅ Opening browser...\n');
        }
      });
    }, 3000);
  }

  // Determine command
  const host = networkAccess ? '0.0.0.0' : 'localhost';
  const command = production ? 'next start' : 'next dev';
  const nextArgs = production ? ['-H', host, '-p', port.toString()] : ['-H', host, '-p', port.toString()];

  // Set environment
  const env = { ...process.env, PORT: port.toString() };

  // Start the Next.js server
  const serverProcess = spawn('npx', [command.split(' ')[0], command.split(' ')[1], ...nextArgs].filter(Boolean), {
    cwd: __dirname + '/..',
    env,
    stdio: 'inherit',
    shell: true,  // Required for Windows to find npx
  });

  serverProcess.on('error', (error) => {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0) {
      console.log(`\n⚠️  Server exited with code ${code}`);
    }
    process.exit(code);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down server...\n');
    serverProcess.kill('SIGINT');
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });

  process.on('SIGTERM', () => {
    serverProcess.kill('SIGTERM');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
