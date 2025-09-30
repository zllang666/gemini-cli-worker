# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Core Development
- **Install dependencies**: `npm install`
- **Local development**: `npm run dev` (starts Wrangler dev server on port 8787)
- **Build/validate**: `npm run build` (dry-run deployment with output to `dist/`)
- **Deploy**: `npm run deploy` (deploy to Cloudflare Workers)

### Code Quality
- **Linting**: `npm run lint` (ESLint TypeScript files)
- **Fix linting**: `npm run lint:fix` (auto-fix linting issues)
- **Format code**: `npm run format` (Prettier formatting)
- **Check formatting**: `npm run format:check` (verify formatting)

### Docker Development
- **Build container**: `npm run docker:build`
- **Development with rebuild**: `npm run docker:dev`
- **Start container**: `npm run docker:start`
- **Stop container**: `npm run docker:stop`
- **Clean containers**: `npm run docker:clean`
- **View logs**: `npm run docker:logs`
- **Shell access**: `npm run docker:shell`

## Architecture Overview

This is a **Cloudflare Workers** application that provides OpenAI-compatible API endpoints for Google's Gemini models using OAuth2 authentication. The architecture consists of:

### Core Components
- **Hono web framework** for routing and middleware
- **OAuth2 authentication** with Google Cloud Code Assist API
- **Cloudflare KV storage** for token caching
- **Multi-route architecture** supporting both OpenAI-compatible and native Gemini APIs

### Key Source Files
- `src/index.ts`: Main application entry point with route setup
- `src/auth.ts`: OAuth2 authentication manager with KV token caching
- `src/gemini-client.ts`: Gemini API client wrapper
- `src/routes/openai.ts`: OpenAI-compatible endpoints (`/v1/chat/completions`, `/v1/models`)
- `src/routes/gemini.ts`: Native Gemini API proxy (`/v1beta/*`, root paths)
- `src/routes/debug.ts`: Debug endpoints for troubleshooting
- `src/stream-transformer.ts`: Streaming response transformation
- `src/types.ts`: TypeScript interfaces and type definitions

### Authentication Flow
1. Uses OAuth2 credentials from Google Gemini CLI (`GCP_SERVICE_ACCOUNT` env var)
2. Implements intelligent token caching via Cloudflare KV
3. Automatic token refresh when expired
4. Optional API key authentication for client requests (`OPENAI_API_KEY` env var)

### API Endpoints
- **OpenAI-compatible**: `/v1/chat/completions`, `/v1/models`
- **Native Gemini**: `/v1beta/models/{model}:generateContent` and root paths
- **Debug**: `/v1/debug/cache`, `/v1/token-test`, `/v1/test`

## Environment Configuration

### Required Environment Variables
- `GCP_SERVICE_ACCOUNT`: OAuth2 credentials JSON from Gemini CLI authentication
- `GEMINI_CLI_KV`: Cloudflare KV namespace binding for token caching

### Optional Environment Variables
- `GEMINI_PROJECT_ID`: Google Cloud Project ID (auto-discovered if not set)
- `OPENAI_API_KEY`: API key for client authentication (if not set, API is public)
- `ENABLE_FAKE_THINKING`: Enable synthetic thinking output (set to "true")
- `ENABLE_REAL_THINKING`: Enable real Gemini thinking capabilities (set to "true")
- `STREAM_THINKING_AS_CONTENT`: Stream thinking as content with `<thinking>` tags (set to "true")
- `ENABLE_AUTO_MODEL_SWITCHING`: Enable automatic fallback from pro to flash models on rate limits (set to "true")

## Development Setup

### Prerequisites
- Node.js and npm
- Wrangler CLI (`npm install -g wrangler`)
- Google account with Gemini CLI access
- Cloudflare account with Workers enabled

### Local Development
1. Create KV namespace: `wrangler kv namespace create "GEMINI_CLI_KV"`
2. Update `wrangler.toml` with KV namespace ID
3. Create `.dev.vars` file with required environment variables
4. Run `npm run dev` for local development server

### Deployment
- For production: Set secrets with `wrangler secret put GCP_SERVICE_ACCOUNT`
- Deploy with `npm run deploy`

### API Authentication
When `OPENAI_API_KEY` is set in environment variables, all API endpoints require authentication.

#### OpenAI Compatible API (`/v1/*`)
OpenAI-compatible endpoints only support header-based authentication:
- **Authorization header**: `Authorization: Bearer <your-api-key>`
- **Google API key header**: `x-goog-api-key: <your-api-key>`

#### Gemini Native API (`/v1beta/*` and root paths)
Gemini native endpoints support multiple authentication methods:
- **Authorization header**: `Authorization: Bearer <your-api-key>`
- **Google API key header**: `x-goog-api-key: <your-api-key>`
- **URL parameter**: `?key=<your-api-key>` (Gemini native style)

#### Examples
```bash
# OpenAI API with header authentication
curl -H "Authorization: Bearer sk-suncloud" https://your-worker.workers.dev/v1/models

# Gemini API with header authentication  
curl -H "Authorization: Bearer sk-suncloud" https://your-worker.workers.dev/models

# Gemini API with URL parameter authentication (native style)
curl "https://your-worker.workers.dev/models?key=sk-suncloud"
curl "https://your-worker.workers.dev/v1beta/models?key=sk-suncloud"
```

## Testing and Debugging

### Debug Endpoints
- `GET /v1/debug/cache`: Check KV token cache status
- `POST /v1/token-test`: Test OAuth2 authentication only
- `POST /v1/test`: Test full API flow

### Local Testing
- Development server runs on `http://localhost:8787`
- Use debug endpoints to verify authentication and token caching
- Test with OpenAI SDK or cURL against local endpoints

## Key Features

### Multi-Modal Support
- Vision-capable models support image inputs (base64 or URLs)
- Compatible with OpenAI's image message format

### Thinking Models
- Supports both fake and real thinking modes
- Real thinking uses Gemini's native reasoning capabilities
- Configurable thinking budget for token limits

### Auto Model Switching
- Automatic fallback from premium to flash models on rate limits
- Seamless continuity for users when quota is exhausted

### Streaming Support
- Real-time streaming responses compatible with OpenAI SDK
- Server-sent events for live conversation experience