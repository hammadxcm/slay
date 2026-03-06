import type { ProcessInfo } from '../types.js';

const SYSTEM_PORTS = new Set([22, 53, 80, 443, 631, 5353]);

export function isSystemPort(port: number): boolean {
  return SYSTEM_PORTS.has(port) || port < 1024;
}

export function getSystemPortWarning(processes: ProcessInfo[]): string[] {
  const warnings: string[] = [];
  for (const p of processes) {
    if (isSystemPort(p.port)) {
      warnings.push(
        `Port ${p.port} is a system/privileged port${p.command ? ` (${p.command})` : ''}`,
      );
    }
  }
  return warnings;
}

const KNOWN_COMMANDS: Record<string, string> = {
  node: 'Node.js',
  python: 'Python',
  python3: 'Python',
  ruby: 'Ruby',
  java: 'Java',
  nginx: 'Nginx',
  apache2: 'Apache',
  httpd: 'Apache',
  postgres: 'PostgreSQL',
  mysqld: 'MySQL',
  mongod: 'MongoDB',
  redis: 'Redis',
  'redis-server': 'Redis',
  docker: 'Docker',
  'docker-proxy': 'Docker',
  code: 'VS Code',
  Electron: 'Electron',
  php: 'PHP',
  go: 'Go',
  deno: 'Deno',
  bun: 'Bun',
};

const KNOWN_PORTS: Record<number, string> = {
  80: 'HTTP',
  443: 'HTTPS',
  3000: 'Dev Server',
  3001: 'Dev Server',
  4200: 'Angular',
  5000: 'Flask/Vite',
  5173: 'Vite',
  5432: 'PostgreSQL',
  3306: 'MySQL',
  6379: 'Redis',
  8080: 'HTTP Alt',
  8443: 'HTTPS Alt',
  8888: 'Jupyter',
  9090: 'Prometheus',
  27017: 'MongoDB',
};

export function enrichLabel(proc: ProcessInfo): ProcessInfo {
  if (proc.label) return proc;

  const parts: string[] = [];

  if (proc.command) {
    const base = proc.command.split('/').pop()?.toLowerCase() || proc.command;
    const known = KNOWN_COMMANDS[base];
    if (known) parts.push(known);
    else parts.push(proc.command);
  }

  const portLabel = KNOWN_PORTS[proc.port];
  if (portLabel && !parts.includes(portLabel)) {
    parts.push(portLabel);
  }

  return { ...proc, label: parts.join(' / ') || undefined };
}
