import { Hono } from "hono";
import { Env } from "./types";
import { OpenAIRoute } from "./routes/openai";
import { DebugRoute } from "./routes/debug";
import { GeminiRoute } from "./routes/gemini";
import { openAIApiKeyAuth, geminiApiKeyAuth } from "./middlewares/auth";
import { loggingMiddleware } from "./middlewares/logging";

/**
 * Gemini CLI OpenAI Worker
 *
 * A Cloudflare Worker that provides both OpenAI-compatible API endpoints
 * and native Gemini API forwarding for Google's Gemini models via the Gemini CLI OAuth flow.
 *
 * Features:
 * - OpenAI-compatible chat completions and model listing
 * - Native Gemini API request forwarding
 * - OAuth2 authentication with token caching via Cloudflare KV
 * - Support for multiple Gemini models (2.5 Pro, 2.0 Flash, 1.5 Pro, etc.)
 * - Streaming responses compatible with OpenAI SDK and native Gemini API
 * - Debug and testing endpoints for troubleshooting
 */

// Create the main Hono app
const app = new Hono<{ Bindings: Env }>();

// Add logging middleware
app.use("*", loggingMiddleware);

// Add CORS headers for all requests
app.use("*", async (c, next) => {
	// Set CORS headers
	c.header("Access-Control-Allow-Origin", "*");
	c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	c.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-goog-api-key");

	// Handle preflight requests
	if (c.req.method === "OPTIONS") {
		c.status(204);
		return c.body(null);
	}

	await next();
});

// Apply OpenAI API key authentication middleware to all /v1 routes (OpenAI compatible)
app.use("/v1/*", openAIApiKeyAuth);

// Apply Gemini API key authentication middleware to /v1beta routes (native Gemini API)
app.use("/v1beta/*", geminiApiKeyAuth);

// Apply Gemini API key authentication middleware to root Gemini API routes
app.use("/*", geminiApiKeyAuth);

// Setup route handlers
app.route("/v1", OpenAIRoute);
app.route("/v1/debug", DebugRoute);

// Add /v1beta route that points to Gemini native API
app.route("/v1beta", GeminiRoute);

// Add individual debug routes to main app for backward compatibility
app.route("/v1", DebugRoute);

// Root endpoint - basic info about the service (must be defined before gemini routes)
app.get("/", (c) => {
	const requiresAuth = !!c.env.OPENAI_API_KEY;

	return c.json({
		name: "Gemini CLI OpenAI Worker",
		description: "OpenAI-compatible and native Gemini API for Google Gemini models via OAuth",
		version: "1.0.0",
		authentication: {
			required: requiresAuth,
			type: requiresAuth ? "Bearer token in Authorization header, x-goog-api-key header, or key URL parameter (native APIs only)" : "None"
		},
		endpoints: {
			openai_compatible: {
				chat_completions: "/v1/chat/completions",
				models: "/v1/models"
			},
			native_gemini: {
				root: {
					models: "/models",
					generate_content: "/models/{model}/generateContent",
					generate_content_colon: "/models/{model}:generateContent",
					stream_generate_content: "/models/{model}/streamGenerateContent",
					stream_generate_content_colon: "/models/{model}:streamGenerateContent",
					search_test: "/search-test"
				},
				v1beta: {
					models: "/v1beta/models",
					generate_content: "/v1beta/models/{model}/generateContent",
					generate_content_colon: "/v1beta/models/{model}:generateContent",
					stream_generate_content: "/v1beta/models/{model}/streamGenerateContent",
					stream_generate_content_colon: "/v1beta/models/{model}:streamGenerateContent",
					search_test: "/v1beta/search-test"
				}
			},
			debug: {
				cache: "/v1/debug/cache",
				token_test: "/v1/token-test",
				full_test: "/v1/test"
			}
		},
		documentation: "https://github.com/gewoonjaap/gemini-cli-openai"
	});
});

// Health check endpoint
app.get("/health", (c) => {
	return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Add gemini routes to root path (after specific routes to avoid conflicts)
app.route("/", GeminiRoute);

export default app;
