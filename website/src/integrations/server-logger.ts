import { networkInterfaces } from 'node:os';
import type { AstroIntegration } from 'astro';

const BOLD = '\x1b[1m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const BG_RED = '\x1b[41m';
const WHITE = '\x1b[37m';

function getLocalIP(): string | null {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

function getTimestamp(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export default function serverLogger(): AstroIntegration {
  return {
    name: 'slay-server-logger',
    hooks: {
      'astro:server:start': ({ address }) => {
        const port = address.port;
        const localURL = `http://localhost:${port}/`;
        const localIP = getLocalIP();
        const networkURL = localIP ? `http://${localIP}:${port}/` : null;
        const env = process.env.NODE_ENV || 'development';
        const time = getTimestamp();

        console.log('');
        console.log(`  ${BG_RED}${WHITE}${BOLD} SLAY ${RESET} ${DIM}dev server ready${RESET}`);
        console.log('');
        console.log(`  ${DIM}├─${RESET} ${BOLD}Local${RESET}     ${CYAN}${localURL}${RESET}`);
        if (networkURL) {
          console.log(`  ${DIM}├─${RESET} ${BOLD}Network${RESET}   ${CYAN}${networkURL}${RESET}`);
        }
        console.log(`  ${DIM}├─${RESET} ${BOLD}Port${RESET}      ${GREEN}${port}${RESET}`);
        console.log(`  ${DIM}├─${RESET} ${BOLD}Env${RESET}       ${YELLOW}${env}${RESET}`);
        console.log(`  ${DIM}╰─${RESET} ${BOLD}Started${RESET}   ${DIM}${time}${RESET}`);
        console.log('');
      },
    },
  };
}
