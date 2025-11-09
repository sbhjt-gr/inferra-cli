# Inferra CLI

A terminal-based client for the Inferra local server REST API. Chat with your local AI models directly from the command line with streaming responses and full conversation history.

## Overview

This is an example application showing how to build clients using the Inferra REST APIs. It connects to your Inferra server and provides a functional chat interface in your terminal.

The CLI is built with React and Ink for terminal rendering, TypeScript for type safety, and uses the undici fetch API for HTTP streaming. It shows how to handle real-time streaming responses, manage conversation state, and create interactive terminal UIs.

## Features

Interactive setup flow that connects to your Inferra server and discovers available models automatically. The interface displays conversation history with proper formatting and streams model responses in real-time as they generate.

Conversation context is maintained across multiple turns for natural back-and-forth conversations. Messages are clearly distinguished between user input and assistant responses.

## Technology Stack

The application uses React with Ink to render components to the terminal instead of the browser. TypeScript provides type safety throughout the codebase. The build system uses esbuild for fast compilation.

Network communication is handled through undici's fetch implementation with streaming support. The streaming chat endpoint returns server-sent events that are parsed and displayed progressively. State management uses React Context API for clean separation of concerns.

## Prerequisites

Node.js version 20 or higher is required. The application uses modern JavaScript features and ESM modules.

You need a running Inferra server on your mobile device. Start it from the Server tab in the Inferra app and note the URL, typically `http://192.168.1.XXX:8889`.

## Installation

Install dependencies and build the project:

```bash
cd inferra-cli
npm install
npm run build
```

## Usage

Start the CLI:

```bash
npm start
```

Follow the interactive setup to enter your server URL and select a model using arrow keys. After setup, type messages and press Enter to send. Model responses stream in real-time. Press Ctrl+C to exit.

## Configuration

Models are discovered automatically from your server. Server URL and model selection are not persisted between sessions. Restart the application to change servers or models.

## Development

Run in development mode with automatic rebuilds:

```bash
npm run dev
```

The codebase uses TypeScript compiled with esbuild. Entry point is `src/index.ts`. Core API client is in `src/core/api-client.ts`. UI components are in `src/ui/` using React and Ink.

## Architecture

React components render to the terminal via Ink instead of DOM. State management uses React Context API for separation between UI and business logic. Streaming uses async generators that yield text chunks from the server.

The chat interface maintains conversation history in a React state array. User input is handled through Ink's useInput hook. Messages include timestamps and role indicators for clear display formatting.

## API Integration

Communication uses standard HTTP with undici's fetch implementation. POST requests to `/api/chat` include conversation history. The server streams JSON chunks containing response text that are parsed and displayed progressively.

Model discovery queries the `/api/tags` endpoint for available models. This provides an up-to-date selection menu without hardcoded values.

## Troubleshooting

Connection issues: Verify the Inferra server is running and your computer is on the same WiFi network. Check the URL matches what the Inferra app displays.

Empty model list: Ensure at least one model is downloaded in the Inferra app. Models must be stored locally before they appear in the CLI.

Streaming problems: Check your network connection. A stable WiFi connection is required for streaming sessions.

## Contributing

This is an example application for the Inferra REST APIs. The code is structured to be readable and educational, showing best practices for API integration and terminal UI development with React and Ink.

To contribute, open an issue to discuss your changes, then submit a pull request with your implementation.

## License

This project is part of the Inferra ecosystem and is distributed under the same AGPL-3.0 license. See the LICENSE file in the root directory for details.
