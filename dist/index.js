#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/ui/colors.ts
var colorMap;
var init_colors = __esm({
  "src/ui/colors.ts"() {
    "use strict";
    colorMap = {
      primary: "cyan",
      secondary: "yellow",
      success: "green",
      error: "red",
      warning: "yellow",
      info: "cyan",
      muted: "gray"
    };
  }
});

// src/ui/layouts/DefaultAppHeader.tsx
import { Box, Text } from "ink";
import { jsx } from "react/jsx-runtime";
var logo, DefaultAppHeader;
var init_DefaultAppHeader = __esm({
  "src/ui/layouts/DefaultAppHeader.tsx"() {
    "use strict";
    init_colors();
    logo = `
 \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
 \u2551  INFERRA CLI v2   \u2551
 \u2551  Local AI Server  \u2551
 \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
`;
    DefaultAppHeader = () => {
      return /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Text, { color: colorMap.primary, children: logo }) });
    };
  }
});

// src/ui/layouts/DefaultAppFooter.tsx
import { Text as Text2 } from "ink";
import { jsx as jsx2 } from "react/jsx-runtime";
var DefaultAppFooter;
var init_DefaultAppFooter = __esm({
  "src/ui/layouts/DefaultAppFooter.tsx"() {
    "use strict";
    init_colors();
    DefaultAppFooter = () => {
      return /* @__PURE__ */ jsx2(Text2, { color: colorMap.muted, dimColor: true, children: "[Enter: send] [Ctrl+C: exit] [Ctrl+K: clear]" });
    };
  }
});

// src/ui/layouts/MainLayout.tsx
import { Box as Box3 } from "ink";
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
var MainLayout;
var init_MainLayout = __esm({
  "src/ui/layouts/MainLayout.tsx"() {
    "use strict";
    init_DefaultAppHeader();
    init_DefaultAppFooter();
    MainLayout = ({ children }) => {
      return /* @__PURE__ */ jsxs(Box3, { flexDirection: "column", height: "100%", children: [
        /* @__PURE__ */ jsx3(DefaultAppHeader, {}),
        /* @__PURE__ */ jsx3(Box3, { flexDirection: "column", flexGrow: 1, paddingX: 2, paddingY: 1, overflowY: "hidden", children }),
        /* @__PURE__ */ jsx3(DefaultAppFooter, {})
      ] });
    };
  }
});

// src/core/api-client.ts
import { fetch } from "undici";
var ApiError, InferraClient;
var init_api_client = __esm({
  "src/core/api-client.ts"() {
    "use strict";
    ApiError = class extends Error {
      status;
      data;
      constructor(message, status, data) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
      }
    };
    InferraClient = class {
      baseUrl;
      constructor(baseUrl) {
        if (!baseUrl || !baseUrl.trim()) {
          throw new Error("Server URL is required");
        }
        this.baseUrl = baseUrl.replace(/\/$/, "");
      }
      async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
          headers: {
            "Content-Type": "application/json",
            ...options.headers
          },
          ...options
        };
        if (options.body && typeof options.body === "object") {
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
          const err = error;
          throw new ApiError(`Network error: ${err.message}`, 0, null);
        }
      }
      async chat(params) {
        const { model, messages, stream = true, temperature = 0.7, max_tokens } = params;
        const body = { model, messages, stream, temperature };
        if (max_tokens)
          body.max_tokens = max_tokens;
        if (stream) {
          return this.streamChat(body);
        } else {
          return this.request("/api/chat", { method: "POST", body });
        }
      }
      async *streamChat(body) {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (!response.ok) {
          const data = await response.text();
          const parsed = data ? JSON.parse(data) : null;
          throw new ApiError(parsed?.error || `HTTP ${response.status}`, response.status, parsed);
        }
        const reader = response.body?.getReader();
        if (!reader) {
          throw new ApiError("Response body is not readable", 0, null);
        }
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done)
              break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim());
            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                yield data;
                if (data.done)
                  return;
              } catch (e) {
                continue;
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
      async *streamGenerate(body) {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (!response.ok) {
          const data = await response.text();
          const parsed = data ? JSON.parse(data) : null;
          throw new ApiError(parsed?.error || `HTTP ${response.status}`, response.status, parsed);
        }
        const reader = response.body?.getReader();
        if (!reader) {
          throw new ApiError("Response body is not readable", 0, null);
        }
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done)
              break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
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
      async generate(params) {
        const { model, prompt, stream = false, temperature = 0.7, max_tokens } = params;
        const body = { prompt, stream, temperature };
        if (max_tokens)
          body.max_tokens = max_tokens;
        if (model)
          body.model = model;
        if (stream) {
          return this.streamGenerate(body);
        } else {
          return this.request("/api/generate", { method: "POST", body });
        }
      }
      async listModels() {
        const response = await this.request("/api/tags");
        let models = response.models || [];
        try {
          const afStatus = await this.getAppleFoundationStatus();
          if (afStatus.enabled && afStatus.available) {
            models.push({
              name: "apple-foundation",
              model_type: "apple-foundation",
              is_external: true,
              size: 0
            });
          }
        } catch (err) {
        }
        return models;
      }
      async listLoadedModels() {
        const response = await this.request("/api/ps");
        return response.models || [];
      }
      async loadModel(modelName) {
        return this.request("/api/models", {
          method: "POST",
          body: { action: "load", model: modelName }
        });
      }
      async unloadModel(modelName) {
        return this.request("/api/models", {
          method: "POST",
          body: { action: "unload", model: modelName }
        });
      }
      async getModelInfo(modelName) {
        return this.request("/api/show", {
          method: "POST",
          body: { model: modelName }
        });
      }
      async getServerStatus() {
        return this.request("/api/status");
      }
      async getVersion() {
        return this.request("/api/version");
      }
      async ingestFiles(files) {
        const body = Array.isArray(files) ? { files } : { content: files };
        return this.request("/api/files/ingest", { method: "POST", body });
      }
      async queryRAG(query, topK = 5) {
        return this.request("/api/rag", {
          method: "POST",
          body: { query, top_k: topK }
        });
      }
      async listRAGDocuments() {
        return this.request("/api/rag");
      }
      async getEmbeddings(model, input) {
        return this.request("/api/embeddings", {
          method: "POST",
          body: { model, input }
        });
      }
      async pullModel(url, modelName) {
        return this.request("/api/pull", {
          method: "POST",
          body: { url, model: modelName }
        });
      }
      async deleteModel(modelName) {
        return this.request("/api/delete", {
          method: "DELETE",
          body: { name: modelName }
        });
      }
      async copyModel(source, destination) {
        return this.request("/api/copy", {
          method: "POST",
          body: { source, destination }
        });
      }
      async getRemoteModelStatus() {
        return this.request("/api/models/remote/status");
      }
      async configureRemoteModel(provider, model, apiKey) {
        return this.request("/api/models/remote", {
          method: "POST",
          body: { provider, model, apiKey }
        });
      }
      async getAppleFoundationStatus() {
        return this.request("/api/models/apple-foundation");
      }
      async configureAppleFoundation(enabled, model) {
        return this.request("/api/models/apple-foundation", {
          method: "POST",
          body: { enabled, model }
        });
      }
      async configureThinking(enabled, model, maxThinkingTokens) {
        const body = { enabled };
        if (model)
          body.model = model;
        if (maxThinkingTokens)
          body.max_thinking_tokens = maxThinkingTokens;
        return this.request("/api/settings/thinking", {
          method: "POST",
          body
        });
      }
    };
  }
});

// src/ui/components/ChatInterface.tsx
import { useState, useEffect, useRef } from "react";
import { Box as Box4, Text as Text3, useInput, useApp } from "ink";
import Spinner from "ink-spinner";
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
var ChatInterface;
var init_ChatInterface = __esm({
  "src/ui/components/ChatInterface.tsx"() {
    "use strict";
    init_api_client();
    init_colors();
    ChatInterface = ({ initialMessage, model, serverUrl, onExit }) => {
      const [messages, setMessages] = useState([]);
      const [input, setInput] = useState(initialMessage || "");
      const [isLoading, setIsLoading] = useState(false);
      const [streamingContent, setStreamingContent] = useState("");
      const [isStreaming, setIsStreaming] = useState(false);
      const { exit } = useApp();
      const clientRef = useRef(null);
      useEffect(() => {
        clientRef.current = new InferraClient(serverUrl);
      }, [serverUrl]);
      const sendMessage = async () => {
        if (!input.trim() || isLoading)
          return;
        const userMsg = {
          id: Date.now().toString(),
          role: "user",
          content: input,
          timestamp: /* @__PURE__ */ new Date()
        };
        setInput("");
        setIsLoading(true);
        setIsStreaming(true);
        setStreamingContent("");
        const history = [...messages, userMsg];
        setMessages(history);
        try {
          if (!clientRef.current) {
            throw new Error("client_init_failed");
          }
          if (!history || history.length === 0) {
            throw new Error("conv_empty");
          }
          const conv = history.map((msg) => ({
            role: msg.role,
            content: msg.content
          }));
          const stream = await clientRef.current.chat({
            model,
            messages: conv,
            stream: true
          });
          let content = "";
          for await (const chunk of stream) {
            if (!chunk)
              continue;
            if (chunk.response) {
              content += chunk.response;
              setStreamingContent(content);
            }
            if (chunk.done)
              break;
          }
          if (!content) {
            content = "no_response";
          }
          const assistantMsg = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content,
            timestamp: /* @__PURE__ */ new Date()
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error || "error");
          const parts = errMsg.split(":");
          const firstPart = parts[0] || errMsg;
          const lines = firstPart.split("\n");
          const firstLine = lines[0] || firstPart;
          const shortMsg = firstLine.slice(0, 30);
          const errResponse = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: `error: ${shortMsg}`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setMessages((prev) => [...prev, errResponse]);
        } finally {
          setIsLoading(false);
          setIsStreaming(false);
          setStreamingContent("");
        }
      };
      useInput((inputChar, key) => {
        if (key.return) {
          sendMessage();
        } else if (key.ctrl && inputChar === "c") {
          if (onExit)
            onExit();
          else
            exit();
        } else if (key.ctrl && inputChar === "k") {
          setMessages([]);
        } else if (key.backspace || key.delete) {
          setInput((prev) => prev.slice(0, -1));
        } else if (!key.ctrl && !key.meta && inputChar) {
          setInput((prev) => prev + inputChar);
        }
      });
      const renderMsg = (msg) => {
        const isUser = msg.role === "user";
        const color = isUser ? colorMap.primary : colorMap.success;
        const label = isUser ? "You" : "Assistant";
        return /* @__PURE__ */ jsxs2(Box4, { flexDirection: "column", marginY: 1, children: [
          /* @__PURE__ */ jsx4(Text3, { color, bold: true, children: label }),
          /* @__PURE__ */ jsx4(Box4, { marginLeft: 2, children: /* @__PURE__ */ jsx4(Text3, { children: msg.content }) })
        ] }, msg.id);
      };
      return /* @__PURE__ */ jsxs2(Box4, { flexDirection: "column", height: "100%", children: [
        /* @__PURE__ */ jsxs2(Box4, { flexDirection: "column", flexGrow: 1, paddingX: 1, overflowY: "hidden", children: [
          messages.map(renderMsg),
          isStreaming && /* @__PURE__ */ jsxs2(Box4, { flexDirection: "column", marginY: 1, children: [
            /* @__PURE__ */ jsx4(Text3, { color: colorMap.success, bold: true, children: "Assistant" }),
            /* @__PURE__ */ jsxs2(Box4, { marginLeft: 2, children: [
              /* @__PURE__ */ jsx4(Text3, { children: streamingContent }),
              /* @__PURE__ */ jsx4(Text3, { color: colorMap.info, children: /* @__PURE__ */ jsx4(Spinner, { type: "dots" }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs2(Box4, { flexDirection: "column", borderStyle: "round", borderColor: colorMap.primary, paddingX: 2, paddingY: 1, marginX: 1, children: [
          /* @__PURE__ */ jsxs2(Box4, { flexDirection: "row", marginBottom: 1, children: [
            /* @__PURE__ */ jsx4(Text3, { color: colorMap.secondary, bold: true, children: "\u25B6" }),
            /* @__PURE__ */ jsx4(Box4, { marginLeft: 1, children: /* @__PURE__ */ jsx4(Text3, { color: colorMap.muted, dimColor: true, children: "Type message" }) }),
            isLoading && !isStreaming && /* @__PURE__ */ jsx4(Box4, { marginLeft: 1, children: /* @__PURE__ */ jsx4(Text3, { color: colorMap.info, children: /* @__PURE__ */ jsx4(Spinner, { type: "dots" }) }) })
          ] }),
          /* @__PURE__ */ jsx4(Box4, { paddingX: 1, borderStyle: "single", borderColor: colorMap.muted, children: /* @__PURE__ */ jsx4(Text3, { color: input ? "white" : colorMap.muted, children: input || "..." }) })
        ] })
      ] });
    };
  }
});

// src/ui/components/SetupFlow.tsx
import { useState as useState2, useEffect as useEffect2 } from "react";
import { Box as Box5, Text as Text4, useInput as useInput2, useApp as useApp2 } from "ink";
import Spinner2 from "ink-spinner";
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
var SetupFlow;
var init_SetupFlow = __esm({
  "src/ui/components/SetupFlow.tsx"() {
    "use strict";
    init_api_client();
    init_colors();
    SetupFlow = ({ onComplete }) => {
      const [step, setStep] = useState2("url");
      const [url, setUrl] = useState2("");
      const [cursor, setCursor] = useState2(0);
      const [models, setModels] = useState2([]);
      const [selectedIdx, setSelectedIdx] = useState2(0);
      const [loading, setLoading] = useState2(false);
      const [error, setError] = useState2("");
      const { exit } = useApp2();
      useEffect2(() => {
        setCursor((c) => Math.min(c, url.length));
      }, [url]);
      useEffect2(() => {
        if (step === "url") {
          setCursor(url.length);
        }
      }, [step]);
      useInput2((input, key) => {
        if (step === "url") {
          if (key.return) {
            validateAndLoadModels();
          } else if (key.leftArrow) {
            setCursor((c) => Math.max(0, c - 1));
          } else if (key.rightArrow) {
            setCursor((c) => Math.min(url.length, c + 1));
          } else if (key.backspace || key.delete && cursor === url.length) {
            setUrl((prev) => {
              if (cursor <= 0)
                return prev;
              const next = prev.slice(0, cursor - 1) + prev.slice(cursor);
              setCursor((c) => Math.max(0, c - 1));
              return next;
            });
          } else if (key.delete) {
            setUrl((prev) => prev.slice(0, cursor) + prev.slice(cursor + 1));
          } else if (!key.ctrl && input) {
            const sanitized = input.replace(/[\r\n]+/g, "");
            if (sanitized) {
              setUrl((prev) => {
                const next = prev.slice(0, cursor) + sanitized + prev.slice(cursor);
                setCursor((c) => c + sanitized.length);
                return next;
              });
            }
          }
        } else if (step === "models") {
          if (key.upArrow) {
            setSelectedIdx((prev) => Math.max(0, prev - 1));
          } else if (key.downArrow) {
            setSelectedIdx((prev) => Math.min(models.length - 1, prev + 1));
          } else if (key.return) {
            selectModel();
          }
        }
        if (key.ctrl && input === "c" || key.ctrl && input === "d") {
          exit();
        }
      });
      const validateAndLoadModels = async () => {
        if (!url.trim()) {
          setError("url_required");
          return;
        }
        setLoading(true);
        try {
          const client = new InferraClient(url);
          const modelList = await client.listModels();
          if (modelList.length === 0) {
            setError("no_models");
          } else {
            setModels(modelList);
            setStep("models");
          }
        } catch (err) {
          setError("connect_failed");
        } finally {
          setLoading(false);
        }
      };
      const selectModel = () => {
        setStep("loading");
        onComplete(url, models[selectedIdx].name);
      };
      if (step === "loading") {
        return /* @__PURE__ */ jsx5(Box5, { flexDirection: "column", padding: 2, children: /* @__PURE__ */ jsxs3(Text4, { color: colorMap.primary, children: [
          /* @__PURE__ */ jsx5(Spinner2, {}),
          " Loading..."
        ] }) });
      }
      return /* @__PURE__ */ jsxs3(Box5, { flexDirection: "column", padding: 2, children: [
        step === "url" && /* @__PURE__ */ jsxs3(Box5, { flexDirection: "column", children: [
          /* @__PURE__ */ jsx5(Text4, { color: colorMap.primary, bold: true, children: "Setup - Enter Server URL" }),
          /* @__PURE__ */ jsxs3(Box5, { marginY: 1, paddingX: 2, children: [
            /* @__PURE__ */ jsxs3(Text4, { children: [
              "URL:",
              " ",
              /* @__PURE__ */ jsxs3(Text4, { children: [
                url.slice(0, cursor),
                /* @__PURE__ */ jsx5(Text4, { backgroundColor: colorMap.secondary, color: "black", children: cursor < url.length ? url[cursor] : " " }),
                url.slice(cursor + (cursor < url.length ? 1 : 0))
              ] })
            ] }),
            loading && /* @__PURE__ */ jsx5(Spinner2, {})
          ] }),
          error && /* @__PURE__ */ jsx5(Text4, { color: colorMap.error, children: error })
        ] }),
        step === "models" && /* @__PURE__ */ jsxs3(Box5, { flexDirection: "column", children: [
          /* @__PURE__ */ jsx5(Text4, { color: colorMap.primary, bold: true, children: "Select Model" }),
          /* @__PURE__ */ jsx5(Box5, { flexDirection: "column", marginY: 1, paddingX: 2, children: models.map((m, i) => /* @__PURE__ */ jsx5(Box5, { marginY: 0, children: /* @__PURE__ */ jsxs3(Text4, { color: i === selectedIdx ? colorMap.secondary : colorMap.muted, children: [
            i === selectedIdx ? "> " : "  ",
            m.name
          ] }) }, m.name)) })
        ] })
      ] });
    };
  }
});

// src/ui/contexts/UIStateContext.tsx
import { createContext } from "react";
import { jsx as jsx6 } from "react/jsx-runtime";
var UIStateContext, UIStateProvider;
var init_UIStateContext = __esm({
  "src/ui/contexts/UIStateContext.tsx"() {
    "use strict";
    UIStateContext = createContext({
      isLoading: false,
      isStreaming: false,
      streamedContent: "",
      setupComplete: false
    });
    UIStateProvider = ({ children, value }) => /* @__PURE__ */ jsx6(UIStateContext.Provider, { value, children });
  }
});

// src/ui/contexts/AppConfigContext.tsx
import { createContext as createContext2 } from "react";
import { jsx as jsx7 } from "react/jsx-runtime";
var AppConfigContext, AppConfigProvider;
var init_AppConfigContext = __esm({
  "src/ui/contexts/AppConfigContext.tsx"() {
    "use strict";
    AppConfigContext = createContext2({
      serverUrl: "",
      modelName: "",
      isInitialized: false
    });
    AppConfigProvider = ({ children, value }) => /* @__PURE__ */ jsx7(AppConfigContext.Provider, { value, children });
  }
});

// src/ui/contexts/StreamingContext.tsx
import { createContext as createContext3 } from "react";
import { jsx as jsx8 } from "react/jsx-runtime";
var StreamingContext, StreamingProvider;
var init_StreamingContext = __esm({
  "src/ui/contexts/StreamingContext.tsx"() {
    "use strict";
    StreamingContext = createContext3({
      isStreaming: false,
      content: "",
      done: false
    });
    StreamingProvider = ({ children, value }) => /* @__PURE__ */ jsx8(StreamingContext.Provider, { value, children });
  }
});

// src/ui/App.tsx
var App_exports = {};
__export(App_exports, {
  App: () => App
});
import { useState as useState3, useMemo } from "react";
import { Box as Box6, Text as Text5 } from "ink";
import { jsx as jsx9, jsxs as jsxs4 } from "react/jsx-runtime";
var App;
var init_App = __esm({
  "src/ui/App.tsx"() {
    "use strict";
    init_MainLayout();
    init_ChatInterface();
    init_SetupFlow();
    init_UIStateContext();
    init_AppConfigContext();
    init_StreamingContext();
    init_colors();
    App = ({ command, args }) => {
      const [setupComplete, setSetupComplete] = useState3(false);
      const [serverUrl, setServerUrl] = useState3("");
      const [modelName, setModelName] = useState3("");
      const [isLoading, setIsLoading] = useState3(false);
      const [streamedContent, setStreamedContent] = useState3("");
      const [isStreaming, setIsStreaming] = useState3(false);
      const [error, setError] = useState3();
      const handleSetupComplete = (url, model) => {
        setServerUrl(url);
        setModelName(model);
        setSetupComplete(true);
      };
      const appConfig = useMemo(
        () => ({
          serverUrl,
          modelName,
          isInitialized: setupComplete
        }),
        [serverUrl, modelName, setupComplete]
      );
      const uiState = useMemo(
        () => ({
          isLoading,
          isStreaming,
          streamedContent,
          error,
          setupComplete
        }),
        [isLoading, isStreaming, streamedContent, error, setupComplete]
      );
      const streamState = useMemo(
        () => ({
          isStreaming,
          content: streamedContent,
          done: !isStreaming
        }),
        [isStreaming, streamedContent]
      );
      if (!setupComplete) {
        return /* @__PURE__ */ jsx9(SetupFlow, { onComplete: handleSetupComplete });
      }
      return /* @__PURE__ */ jsx9(AppConfigProvider, { value: appConfig, children: /* @__PURE__ */ jsx9(UIStateProvider, { value: uiState, children: /* @__PURE__ */ jsx9(StreamingProvider, { value: streamState, children: /* @__PURE__ */ jsx9(MainLayout, { children: command === "chat" || !command ? /* @__PURE__ */ jsx9(
        ChatInterface,
        {
          initialMessage: args?.message,
          model: modelName,
          serverUrl
        }
      ) : /* @__PURE__ */ jsxs4(Box6, { flexDirection: "column", justifyContent: "center", children: [
        /* @__PURE__ */ jsx9(Text5, { color: colorMap.primary, bold: true, children: "ready" }),
        /* @__PURE__ */ jsxs4(Text5, { color: colorMap.success, children: [
          "model: ",
          modelName
        ] })
      ] }) }) }) }) });
    };
  }
});

// src/cli.ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createElement } from "react";

// src/commands/chat.ts
init_App();
import React7 from "react";
import { render } from "ink";
var chatCommand = {
  command: "chat [message]",
  describe: "Start interactive chat session",
  builder: function(yargs2) {
    return yargs2.positional("message", {
      describe: "Initial message to send",
      type: "string"
    }).option("model", {
      alias: "m",
      describe: "Model to use",
      type: "string"
    }).option("system", {
      alias: "s",
      describe: "System message",
      type: "string"
    }).option("stream", {
      describe: "Enable streaming",
      type: "boolean",
      default: true
    });
  },
  handler: function(argv) {
    render(React7.createElement(App, {
      command: "chat",
      args: argv
    }));
  }
};

// src/commands/generate.ts
init_api_client();

// src/config/config.ts
import os from "os";
import path from "path";
import fs from "fs/promises";
var defaultConfig = {
  server: {
    url: "",
    timeout: 3e4,
    autoDiscover: true
  },
  defaults: {
    model: "",
    temperature: 0.7,
    maxTokens: 2048,
    stream: true
  },
  ui: {
    theme: "default",
    syntaxHighlight: true,
    showTokenCount: true,
    animateStreaming: true
  },
  rag: {
    autoIngest: false,
    topK: 5
  }
};
var ConfigManager = class {
  configPath;
  config;
  constructor() {
    this.configPath = path.join(os.homedir(), ".inferra", "config.json");
    this.config = { ...defaultConfig };
  }
  async load() {
    try {
      const data = await fs.readFile(this.configPath, "utf8");
      const userConfig = JSON.parse(data);
      this.config = this.mergeConfig(defaultConfig, userConfig);
    } catch (error) {
      const err = error;
      if (err.code !== "ENOENT") {
        console.warn("Warning: Could not load config file:", err.message);
      }
      this.config = { ...defaultConfig };
    }
  }
  async save() {
    try {
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      const err = error;
      console.error("Error saving config:", err.message);
    }
  }
  get() {
    return { ...this.config };
  }
  set(key, value) {
    const keys = key.split(".");
    let current = this.config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }
  getServerUrl() {
    return this.config.server.url;
  }
  setServerUrl(url) {
    this.config.server.url = url;
  }
  async hasUserConfig() {
    try {
      await fs.access(this.configPath);
      return true;
    } catch {
      return false;
    }
  }
  mergeConfig(base, override) {
    const result = { ...base };
    for (const key in override) {
      if (override.hasOwnProperty(key)) {
        const baseValue = base[key];
        const overrideValue = override[key];
        if (baseValue && typeof baseValue === "object" && !Array.isArray(baseValue) && overrideValue && typeof overrideValue === "object" && !Array.isArray(overrideValue)) {
          result[key] = this.mergeConfig(baseValue, overrideValue);
        } else {
          result[key] = overrideValue;
        }
      }
    }
    return result;
  }
};
var configManager = new ConfigManager();

// src/commands/generate.ts
var generateCommand = {
  command: "generate <prompt>",
  describe: "Generate text completion",
  builder: function(yargs2) {
    return yargs2.positional("prompt", {
      describe: "Prompt to generate from",
      type: "string",
      demandOption: true
    }).option("model", {
      alias: "m",
      describe: "Model to use",
      type: "string"
    }).option("max-tokens", {
      describe: "Maximum tokens to generate",
      type: "number"
    }).option("stream", {
      describe: "Enable streaming",
      type: "boolean",
      default: false
    });
  },
  handler: async function(argv) {
    const prompt = argv.prompt || argv._[1];
    const model = argv.model;
    const maxTokens = argv.maxTokens || configManager.get().defaults.maxTokens;
    const stream = argv.stream;
    const url = configManager.get().server.url;
    try {
      const client = new InferraClient(url);
      if (stream) {
        console.log("Streaming generation...");
        const params = {
          prompt,
          max_tokens: maxTokens,
          stream: true
        };
        if (model)
          params.model = model;
        const stream2 = await client.generate(params);
        for await (const chunk of stream2) {
          process.stdout.write(chunk.content || "");
        }
        console.log("\n");
      } else {
        const params = {
          prompt,
          max_tokens: maxTokens,
          stream: false
        };
        if (model)
          params.model = model;
        const response = await client.generate(params);
        console.log(response.response);
      }
    } catch (error) {
      console.error("\u274C Generation failed:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
};

// src/commands/models.ts
init_api_client();
var modelsCommand = {
  command: "models <action>",
  describe: "Manage AI models",
  builder: function(yargs2) {
    return yargs2.positional("action", {
      describe: "Action to perform",
      type: "string",
      choices: ["list", "load", "unload", "info", "pull", "delete", "copy"]
    }).option("model", {
      alias: "m",
      describe: "Model name",
      type: "string"
    });
  },
  handler: async function(argv) {
    const action = argv.action || argv._[1];
    const model = argv.model || argv._[2];
    const url = configManager.get().server.url;
    try {
      const client = new InferraClient(url);
      switch (action) {
        case "list":
          await listModels(client);
          break;
        case "load":
          if (!model) {
            console.error("\u274C Model name is required for load action");
            process.exit(1);
          }
          await loadModel(client, model);
          break;
        case "unload":
          if (!model) {
            console.error("\u274C Model name is required for unload action");
            process.exit(1);
          }
          await unloadModel(client, model);
          break;
        case "info":
          if (!model) {
            console.error("\u274C Model name is required for info action");
            process.exit(1);
          }
          await getModelInfo(client, model);
          break;
        case "pull":
          if (!model) {
            console.error("\u274C Model name is required for pull action");
            process.exit(1);
          }
          await pullModel(client, model);
          break;
        case "delete":
          if (!model) {
            console.error("\u274C Model name is required for delete action");
            process.exit(1);
          }
          await deleteModel(client, model);
          break;
        case "copy":
          console.log("Copy action not yet implemented");
          break;
        default:
          console.log("Unknown action:", action);
      }
    } catch (error) {
      console.error("\u274C Error:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
};
async function listModels(client) {
  const models = await client.listModels();
  console.log("Available models:");
  models.forEach((model) => {
    console.log(`  - ${model.name} (${model.size})`);
  });
}
async function loadModel(client, modelName) {
  console.log(`Loading model: ${modelName}`);
  await client.loadModel(modelName);
  console.log("\u2705 Model loaded successfully");
}
async function unloadModel(client, modelName) {
  console.log(`Unloading model: ${modelName}`);
  await client.unloadModel(modelName);
  console.log("\u2705 Model unloaded successfully");
}
async function getModelInfo(client, modelName) {
  const info = await client.getModelInfo(modelName);
  console.log(`Model: ${modelName}`);
  console.log(JSON.stringify(info, null, 2));
}
async function pullModel(client, modelName) {
  console.log(`Pulling model: ${modelName}`);
  console.log("Pull functionality not yet implemented");
}
async function deleteModel(client, modelName) {
  console.log(`Deleting model: ${modelName}`);
  await client.deleteModel(modelName);
  console.log("\u2705 Model deleted successfully");
}

// src/commands/server.ts
init_api_client();
var serverCommand = {
  command: "server <action>",
  describe: "Server management",
  builder: function(yargs2) {
    return yargs2.positional("action", {
      describe: "Action to perform",
      type: "string",
      choices: ["status", "config", "discover", "info"]
    }).option("url", {
      describe: "Server URL",
      type: "string"
    });
  },
  handler: async function(argv) {
    const action = argv.action || argv._[1];
    const url = argv.url || configManager.get().server.url;
    switch (action) {
      case "status":
        await checkServerStatus(url);
        break;
      case "config":
        showServerConfig();
        break;
      case "discover":
        await discoverServers();
        break;
      case "info":
        await showServerInfo(url);
        break;
      default:
        console.log("Unknown action:", action);
    }
  }
};
async function checkServerStatus(url) {
  try {
    const client = new InferraClient(url);
    const status = await client.getServerStatus();
    console.log("\u2705 Server is running");
    console.log("URL:", url);
    console.log("Version:", status.version);
    console.log("Models loaded:", status.models?.length || 0);
  } catch (error) {
    console.log("\u274C Server is not responding");
    console.log("URL:", url);
    console.log("Error:", error instanceof Error ? error.message : String(error));
  }
}
function showServerConfig() {
  const config = configManager.get();
  console.log("Server Configuration:");
  console.log("URL:", config.server.url);
  console.log("Timeout:", config.server.timeout + "ms");
  console.log("Auto-discover:", config.server.autoDiscover ? "enabled" : "disabled");
}
async function discoverServers() {
  console.log("Discovering servers...");
  console.log("Server discovery not yet implemented");
}
async function showServerInfo(url) {
  try {
    const client = new InferraClient(url);
    const version = await client.getVersion();
    console.log("Server Information:");
    console.log("Version:", version);
  } catch (error) {
    console.log("\u274C Failed to get server info");
    console.log("Error:", error instanceof Error ? error.message : String(error));
  }
}

// src/commands/rag.ts
init_api_client();
var ragCommand = {
  command: "rag <action>",
  describe: "RAG operations",
  builder: function(yargs2) {
    return yargs2.positional("action", {
      describe: "Action to perform",
      type: "string",
      choices: ["ingest", "list", "query", "clear"]
    }).option("files", {
      describe: "Files to ingest",
      type: "array"
    }).option("query", {
      describe: "Query for search",
      type: "string"
    });
  },
  handler: async function(argv) {
    const action = argv.action || argv._[1];
    const files = argv.files;
    const query = argv.query;
    const url = configManager.get().server.url;
    try {
      const client = new InferraClient(url);
      switch (action) {
        case "ingest":
          if (!files || files.length === 0) {
            console.error("\u274C Files are required for ingest action");
            process.exit(1);
          }
          await ingestFiles(client, files);
          break;
        case "list":
          await listDocuments(client);
          break;
        case "query":
          if (!query) {
            console.error("\u274C Query is required for query action");
            process.exit(1);
          }
          await queryRAG(client, query);
          break;
        case "clear":
          console.log("Clear action not yet implemented");
          break;
        default:
          console.log("Unknown action:", action);
      }
    } catch (error) {
      console.error("\u274C Error:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
};
async function ingestFiles(client, files) {
  console.log(`Ingesting ${files.length} file(s)...`);
  await client.ingestFiles(files);
  console.log("\u2705 Files ingested successfully");
}
async function listDocuments(client) {
  const status = await client.listRAGDocuments();
  console.log("RAG Status:");
  console.log(`Enabled: ${status.enabled}`);
  console.log(`Storage: ${status.storage}`);
  console.log(`Ready: ${status.ready}`);
}
async function queryRAG(client, query) {
  console.log(`Querying: "${query}"`);
  const results = await client.queryRAG(query);
  console.log("Results:");
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.content}`);
    console.log(`   Score: ${result.score}`);
    console.log(`   Source: ${result.source}
`);
  });
}

// src/cli.ts
async function runCli() {
  const args = hideBin(process.argv);
  if (args.length === 0) {
    const { render: render2 } = await import("ink");
    const { App: App2 } = await Promise.resolve().then(() => (init_App(), App_exports));
    render2(createElement(App2, { command: "chat", args: {} }));
    return;
  }
  const argv = await yargs(args).scriptName("inferra").usage("$0 <cmd> [args]").command("chat", "Start interactive chat session", chatCommand).command("generate", "Generate text completion", generateCommand).command("models", "Manage AI models", modelsCommand).command("server", "Server management", serverCommand).command("rag", "RAG operations", ragCommand).demandCommand(1, "You need at least one command").help().argv;
  return argv;
}

// src/core/logger.ts
var FatalError = class extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
    this.name = "FatalError";
  }
};
var debugLogger = {
  debug: (message) => {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] ${message}`);
    }
  },
  info: (message) => {
    console.info(message);
  },
  warn: (message) => {
    console.warn(`[WARN] ${message}`);
  },
  error: (message) => {
    console.error(message);
  }
};

// src/index.ts
async function start() {
  await configManager.load();
  await runCli();
}
start().catch((error) => {
  if (error instanceof FatalError) {
    let errorMessage = error.message;
    if (!process.env["NO_COLOR"]) {
      errorMessage = `\x1B[31m${errorMessage}\x1B[0m`;
    }
    debugLogger.error(errorMessage);
    process.exit(error.exitCode);
  }
  debugLogger.error("An unexpected critical error occurred:");
  if (error instanceof Error) {
    debugLogger.error(error.stack || error.message);
  } else {
    debugLogger.error(String(error));
  }
  process.exit(1);
});
//# sourceMappingURL=index.js.map
