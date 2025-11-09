# Inferra CLI

A terminal-based client for interacting with the Inferra local server REST API. This command-line interface provides a modern chat experience directly in your terminal, with support for streaming responses, conversation history, and interactive setup.

## Overview

The Inferra CLI demonstrates how to build applications using the Inferra REST APIs. It connects to your Inferra server running on a mobile device and allows you to chat with local AI models from any computer on the same WiFi network.

The tool is built with React and Ink to provide a rich terminal user interface. It handles streaming responses from the API, maintains conversation context, and provides an intuitive setup flow for connecting to your server.

## Features

The CLI provides a complete chat experience in your terminal. When you start the application, it guides you through connecting to your Inferra server and selecting a model to use. The interface displays your conversation history with proper formatting and supports real-time streaming of model responses.

The tool maintains conversation context across multiple turns, allowing you to have natural back-and-forth conversations with the AI models. All messages are displayed with clear visual distinction between user input and assistant responses.

## Prerequisites

You need Node.js version 20 or higher installed on your system. The CLI is built with modern JavaScript features and requires a recent Node.js runtime.

You also need a running Inferra server on your mobile device. Start the server from the Inferra app's Server tab and note the URL displayed, which typically looks like `http://192.168.1.XXX:8889`.

## Installation

Navigate to the inferra-cli directory and install the dependencies using npm:

```bash
cd inferra-cli
npm install
```

Once the dependencies are installed, build the project:

```bash
npm run build
```

## Usage

Start the CLI tool by running:

```bash
npm start
```

The application will launch an interactive setup flow. You will be prompted to enter your Inferra server URL and select a model from the available options. Use the arrow keys to navigate through the model selection and press Enter to confirm your choice.

After setup is complete, you can start chatting with your selected model. Type your message and press Enter to send it. The model's response will stream in real-time, appearing character by character as it generates.

The conversation history is maintained throughout your session. You can see all previous messages scrolling up as new ones arrive. To exit the application, press Ctrl+C at any time.

## Configuration

The CLI automatically discovers available models from your Inferra server. If you need to change servers or models, simply restart the application and go through the setup flow again.

The tool does not persist your server URL or model selection between sessions. This ensures you always have the flexibility to connect to different servers or use different models without managing configuration files.

## Development

The source code is organized into several directories. The core API client is in `src/core/api-client.ts`, which handles communication with the Inferra REST API. The UI components are in `src/ui/`, built using React and Ink for terminal rendering.

To work on the code, you can use the development mode which watches for changes and rebuilds automatically:

```bash
npm run dev
```

The project uses TypeScript for type safety and esbuild for fast compilation. The entry point is `src/index.ts`, which initializes the UI and starts the application.

## Architecture

The CLI is structured as a React application that renders to the terminal instead of a web browser. It uses the Ink library to create interactive terminal components with familiar React patterns.

The application state is managed through React contexts, providing a clean separation between the UI layer and the business logic. The streaming functionality is handled by async generators that yield chunks of text as they arrive from the server.

The main chat interface maintains conversation history and handles user input through Ink's input hooks. Messages are stored in an array and displayed with proper formatting, including timestamps and role indicators.

## API Integration

The tool communicates with the Inferra server through standard HTTP requests. It uses the fetch API with streaming support to handle real-time responses from the chat endpoint.

When you send a message, the CLI makes a POST request to the `/api/chat` endpoint with your conversation history. The server responds with a stream of JSON chunks, each containing a piece of the response text. The CLI parses these chunks and displays them progressively.

Model discovery is done through the `/api/tags` endpoint, which returns a list of available models on the server. This allows the CLI to present an up-to-date selection menu without hardcoding model names.

## Troubleshooting

If you cannot connect to the server, verify that your Inferra app has the server running and that your computer is on the same WiFi network as your mobile device. Check that the URL you entered matches exactly what is displayed in the Inferra app.

If the model list appears empty, ensure that you have downloaded at least one model in the Inferra app. Models must be stored locally on the device before they appear in the CLI.

For streaming issues or interrupted responses, check your network connection. The CLI requires a stable WiFi connection to maintain the streaming session.

## Contributing

This CLI tool serves as a reference implementation for building applications with the Inferra REST APIs. The code is intentionally structured to be readable and educational, showing best practices for API integration and terminal UI development.

If you want to add features or fix bugs, follow the standard contribution process for the Inferra project. Open an issue first to discuss your proposed changes, then submit a pull request with your implementation.

## License

This project is part of the Inferra ecosystem and is distributed under the same AGPL-3.0 license. See the LICENSE file in the root directory for details.
