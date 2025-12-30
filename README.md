## InferrLM CLI
<p>
	<a href="https://www.npmjs.com/package/inferrlm" target="_blank"><img src="https://img.shields.io/badge/CLI_Version-1.0.0-6a1b9a" alt="CLI Version 1.0.1"></a>
	<a href="https://nodejs.org" target="_blank"><img src="https://img.shields.io/badge/Node.js-%E2%89%A520.0-43853d?logo=node.js&logoColor=white" alt="Node 20 or higher"></a>
	<a href="https://opensource.org/licenses/MIT" target="_blank"><img src="https://img.shields.io/badge/License-MIT-blue" alt="License MIT"></a>
</p>

This is an example application that demonstrates how to build apps using the [InferrLM REST API](https://github.com/sbhjt-gr/inferra/blob/main/docs/REST_APIs.md). It showcases integration patterns for chat streaming, model management, and server communication.

InferrLM CLI is the terminal companion to the InferrLM mobile app. It connects directly to your InferrLM device server so you can chat with on-device or remote models from any computer while keeping the same streaming experience and conversation controls.

## Features

### Terminal Chat Experience
- Interactive onboarding detects your InferrLM server and lists every available model.
- Conversation history stays in session so you can scroll and review past exchanges without leaving the terminal.
- Keyboard-driven UI keeps input and response panes focused on speed and clarity.

### Streaming and Controls
- Real-time streaming mirrors the InferrLM app, rendering tokens as soon as they arrive.
- Retry, stop, and switch-model actions are exposed through key prompts for quick iteration.
- Output formatting highlights code blocks with syntax coloring and preserves markdown structure.

### Server Integration
- Uses the same REST APIs as the mobile app, including `/api/chat` and `/api/tags`.
- Automatically adapts to whatever models you have downloaded or exposed through the InferrLM server.
- Falls back gracefully when the device is unreachable, surfacing actionable errors.

## Getting Started

### Prerequisites
- Node.js 20 or newer
- A running InferrLM server on your phone or tablet (Server tab inside the app)
- Network connectivity between your computer and the device (same WiFi)

### Installation

Install the CLI globally using npm:

```bash
npm install -g inferrlm
```

Or use npx to run it without installation:

```bash
npx inferrlm
```

### Running the CLI

1. Start your InferrLM server from the mobile app (Server tab).
2. Run the CLI:

```bash
inferrlm
```

3. Follow the guided setup to connect to your server.

When prompted, paste the server URL (for example `http://192.168.1.88:8889`), choose a model, and begin chatting. Responses will stream token-by-token until completion or until you stop the generation.

### Development Setup

If you want to contribute or run from source:

1. Clone or download the repository.
2. Move into the CLI workspace and install dependencies.
3. Build the distributable bundle.

```bash
cd inferra-cli
npm install
npm run build
```

Then run locally:

```bash
npm start
```

## Configuration

- Server URL and model choice are stored only for the active session, mirroring the privacy posture of the InferrLM app.
- Model discovery happens automatically by calling `/api/tags`, so the CLI stays up to date with whatever the mobile app exposes.
- Environment variables are not required, but you can provide `INFERRLM_SERVER_URL` to skip the onboarding prompt if desired.

## Usage Tips

- Press Enter to send the current prompt; the stream renders inline underneath your input.
- Use the provided key shortcuts (displayed in the footer) to stop streaming or retry with the same context.
- Copy any response text directly from the terminal; syntax highlighting stays intact thanks to `highlight.js`.

## Development

The CLI is implemented with React, Ink, and TypeScript. The bundler uses esbuild for fast builds, and Vitest powers automated tests.

```bash
# Continuous rebuilds
npm run dev

# Run the test suite
npm test

# Check types and linting
npm run typecheck
npm run lint
```

Source code layout:
- `src/index.ts` bootstraps the Ink tree and command routing.
- `src/core` hosts the REST client, streaming parser, and persistence helpers.
- `src/ui` contains composable Ink components for the chat transcript, input box, and status footer.

## Troubleshooting

- **Cannot connect:** Ensure the InferrLM app shows the same IP address you are entering and that both devices share the network.
- **Empty model list:** Download at least one model inside the mobile app; the CLI only lists what `/api/tags` returns.
- **Interrupted streaming:** Weak WiFi can drop HTTP streams. Retry closer to the router or switch bands.

## Contributing

Contributions follow the same workflow as the main InferrLM app. Open an issue, wait for assignment, then submit a PR that includes tests and lint fixes where applicable. Keep components focused, avoid unnecessary dependencies, and follow the repo TypeScript guidelines.

## License

InferrLM CLI is released under the MIT License. See the root LICENSE file for the full text.

## Tech Stack

- **React + Ink** for terminal rendering
- **TypeScript** with strict typings
- **Undici** for HTTP streaming
- **esbuild** for bundling
- **Vitest** for automated testing