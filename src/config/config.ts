import os from 'os';
import path from 'path';
import fs from 'fs/promises';

interface Config {
  server: {
    url: string;
    timeout: number;
    autoDiscover: boolean;
  };
  defaults: {
    model: string;
    temperature: number;
    maxTokens: number;
    stream: boolean;
  };
  ui: {
    theme: string;
    syntaxHighlight: boolean;
    showTokenCount: boolean;
    animateStreaming: boolean;
  };
  rag: {
    autoIngest: boolean;
    topK: number;
  };
}

const defaultConfig: Config = {
  server: {
    url: '',
    timeout: 30000,
    autoDiscover: true,
  },
  defaults: {
    model: '',
    temperature: 0.7,
    maxTokens: 2048,
    stream: true,
  },
  ui: {
    theme: 'default',
    syntaxHighlight: true,
    showTokenCount: true,
    animateStreaming: true,
  },
  rag: {
    autoIngest: false,
    topK: 5,
  },
};

class ConfigManager {
  private configPath: string;
  private config: Config;

  constructor() {
    this.configPath = path.join(os.homedir(), '.inferra', 'config.json');
    this.config = { ...defaultConfig };
  }

  async load() {
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      const userConfig = JSON.parse(data);
      this.config = this.mergeConfig(defaultConfig, userConfig);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'ENOENT') {
        console.warn('Warning: Could not load config file:', err.message);
      }
      this.config = { ...defaultConfig };
    }
  }

  async save() {
    try {
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      console.error('Error saving config:', err.message);
    }
  }

  get(): Config {
    return { ...this.config };
  }

  set(key: string, value: any) {
    const keys = key.split('.');
    let current = this.config as any;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }

  getServerUrl(): string {
    return this.config.server.url;
  }

  setServerUrl(url: string) {
    this.config.server.url = url;
  }

  async hasUserConfig(): Promise<boolean> {
    try {
      await fs.access(this.configPath);
      return true;
    } catch {
      return false;
    }
  }

  private mergeConfig(base: Config, override: Partial<Config>): Config {
    const result = { ...base };

    for (const key in override) {
      if (override.hasOwnProperty(key)) {
        const baseValue = (base as any)[key];
        const overrideValue = (override as any)[key];

        if (baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue) &&
            overrideValue && typeof overrideValue === 'object' && !Array.isArray(overrideValue)) {
          (result as any)[key] = this.mergeConfig(baseValue, overrideValue);
        } else {
          (result as any)[key] = overrideValue;
        }
      }
    }

    return result;
  }
}

const configManager = new ConfigManager();

export { ConfigManager, configManager };