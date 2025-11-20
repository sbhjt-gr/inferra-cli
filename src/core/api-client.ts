import { fetch } from 'undici';

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

interface ChatParams {
  model: string;
  messages: Array<{role: string, content: string}>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

interface GenerateParams {
  model: string;
  prompt: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

class InferraClient {
  baseUrl: string;

  constructor(baseUrl: string) {
    if (!baseUrl || !baseUrl.trim()) {
      throw new Error('Server URL is required');
    }
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async request(endpoint: string, options: RequestOptions = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.text();

      let parsed;
      try {
        parsed = data ? JSON.parse(data) : null;
      } catch {
        parsed = data;
      }

      if (!response.ok) {
        const errorMessage = parsed?.error || `HTTP ${response.status}`;
        throw new ApiError(errorMessage, response.status, parsed);
      }

      return parsed;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      const err = error as Error;
      throw new ApiError(`Network error: ${err.message}`, 0, null);
    }
  }

  async chat(params: ChatParams) {
    const { model, messages, stream = true, temperature = 0.7, max_tokens } = params;
    const body: any = { model, messages, stream, temperature };
    if (max_tokens) body.max_tokens = max_tokens;

    if (stream) {
      return this.streamChat(body);
    } else {
      return this.request('/api/chat', { method: 'POST', body });
    }
  }

  async *streamChat(body: any) {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.text();
      const parsed = data ? JSON.parse(data) : null;
      throw new ApiError(parsed?.error || `HTTP ${response.status}`, response.status, parsed);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new ApiError('Response body is not readable', 0, null);
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            yield data;
            if (data.done) return;
          } catch (e) {
            continue;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async *streamGenerate(body: any) {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.text();
      const parsed = data ? JSON.parse(data) : null;
      throw new ApiError(parsed?.error || `HTTP ${response.status}`, response.status, parsed);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new ApiError('Response body is not readable', 0, null);
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.response) {
                yield { content: data.response, done: data.done || false };
              }
            } catch {
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async generate(params: GenerateParams) {
    const { model, prompt, stream = false, temperature = 0.7, max_tokens } = params;
    const body: any = { prompt, stream, temperature };
    if (max_tokens) body.max_tokens = max_tokens;
    if (model) body.model = model;

    if (stream) {
      return this.streamGenerate(body);
    } else {
      return this.request('/api/generate', { method: 'POST', body });
    }
  }

  async listModels() {
    const response = await this.request('/api/tags');
    let models = response.models || [];
    
    try {
      const afStatus = await this.getAppleFoundationStatus();
      if (afStatus.enabled && afStatus.available) {
        models.push({
          name: 'apple-foundation',
          model_type: 'apple-foundation',
          is_external: true,
          size: 0
        });
      }
    } catch (err) {
    }
    
    return models;
  }

  async listLoadedModels() {
    const response = await this.request('/api/ps');
    return response.models || [];
  }

  async loadModel(modelName: string) {
    return this.request('/api/models', {
      method: 'POST',
      body: { action: 'load', model: modelName }
    });
  }

  async unloadModel(modelName: string) {
    return this.request('/api/models', {
      method: 'POST',
      body: { action: 'unload', model: modelName }
    });
  }

  async getModelInfo(modelName: string) {
    return this.request('/api/show', {
      method: 'POST',
      body: { model: modelName }
    });
  }

  async getServerStatus() {
    return this.request('/api/status');
  }

  async getVersion() {
    return this.request('/api/version');
  }

  async ingestFiles(files: string | string[]) {
    const body = Array.isArray(files) ? { files } : { content: files };
    return this.request('/api/files/ingest', { method: 'POST', body });
  }

  async queryRAG(query: string, topK = 5) {
    return this.request('/api/rag', {
      method: 'POST',
      body: { query, top_k: topK }
    });
  }

  async listRAGDocuments() {
    return this.request('/api/rag');
  }

  async getEmbeddings(model: string, input: string | string[]) {
    return this.request('/api/embeddings', {
      method: 'POST',
      body: { model, input }
    });
  }

  async pullModel(url: string, modelName: string) {
    return this.request('/api/pull', {
      method: 'POST',
      body: { url, model: modelName }
    });
  }

  async deleteModel(modelName: string) {
    return this.request('/api/delete', {
      method: 'DELETE',
      body: { name: modelName }
    });
  }

  async copyModel(source: string, destination: string) {
    return this.request('/api/copy', {
      method: 'POST',
      body: { source, destination }
    });
  }

  async getRemoteModelStatus() {
    return this.request('/api/models/remote/status');
  }

  async configureRemoteModel(provider: string, model: string, apiKey: string) {
    return this.request('/api/models/remote', {
      method: 'POST',
      body: { provider, model, apiKey }
    });
  }

  async getAppleFoundationStatus() {
    return this.request('/api/models/apple-foundation');
  }

  async configureAppleFoundation(enabled: boolean, model: string) {
    return this.request('/api/models/apple-foundation', {
      method: 'POST',
      body: { enabled, model }
    });
  }

  async configureThinking(enabled: boolean, model?: string, maxThinkingTokens?: number) {
    const body: any = { enabled };
    if (model) body.model = model;
    if (maxThinkingTokens) body.max_thinking_tokens = maxThinkingTokens;
    return this.request('/api/settings/thinking', {
      method: 'POST',
      body
    });
  }
}

export { InferraClient, ApiError };