import dns from 'dns/promises';
import { networkInterfaces } from 'os';

class ServerDiscovery {
  private commonPorts = [8889, 8888, 3000, 8000, 5000];

  async discoverServers(timeout = 5000): Promise<string[]> {
    const candidates: string[] = [];

    try {
      const interfaces = networkInterfaces();
      const localIPs: string[] = [];

      for (const iface of Object.values(interfaces)) {
        if (!iface) continue;
        for (const addr of iface as any[]) {
          if (addr.family === 'IPv4' && !addr.internal && (addr.address.startsWith('192.168.') || addr.address.startsWith('10.') || addr.address.startsWith('172.'))) {
            localIPs.push(addr.address);
          }
        }
      }

      for (const ip of localIPs) {
        const subnet = ip.substring(0, ip.lastIndexOf('.'));
        for (let i = 1; i <= 254; i++) {
          candidates.push(`${subnet}.${i}`);
        }
      }
    } catch (error) {
      const err = error as Error;
      console.warn('Network interface discovery failed:', err.message);
    }

    candidates.push('localhost', '127.0.0.1');

    const servers: string[] = [];
    const checks = candidates.flatMap(ip =>
      this.commonPorts.map(port => this.checkServer(`${ip}:${port}`, timeout))
    );

    const results = await Promise.allSettled(checks);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled' && result.value) {
        const candidateIndex = Math.floor(i / this.commonPorts.length);
        const portIndex = i % this.commonPorts.length;
        const ip = candidates[candidateIndex];
        const port = this.commonPorts[portIndex];
        servers.push(`http://${ip}:${port}`);
      }
    }

    return [...new Set(servers)];
  }

  private async checkServer(url: string, timeout: number): Promise<boolean> {
    const fullUrl = url.startsWith('http') ? url : `http://${url}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${fullUrl}/api/version`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data.version !== undefined;
      }
    } catch (error) {
      // Ignore errors - server not available
    }

    return false;
  }

  async findBestServer(): Promise<string | null> {
    const servers = await this.discoverServers();

    for (const server of servers) {
      try {
        const response = await fetch(`${server}/api/status`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'running') {
            return server;
          }
        }
      } catch (error) {
        continue;
      }
    }

    return servers.length > 0 ? servers[0] : null;
  }
}

const serverDiscovery = new ServerDiscovery();

export { ServerDiscovery, serverDiscovery };