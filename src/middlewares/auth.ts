import { MiddlewareHandler } from "hono";
import { Env } from "../types";

/**
 * Middleware to enforce OpenAI-style API key authentication if OPENAI_API_KEY is set in the environment.
 * Checks for 'Authorization: Bearer <key>' header on protected routes.
 */
export const openAIApiKeyAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
	// Skip authentication for public endpoints
	const publicEndpoints = ["/", "/health"];
	if (publicEndpoints.some((endpoint) => c.req.path === endpoint)) {
		await next();
		return;
	}

	// If OPENAI_API_KEY is set in environment, require authentication
	if (c.env.OPENAI_API_KEY) {
		const authHeader = c.req.header("Authorization");
		const googApiKey = c.req.header("x-goog-api-key");

		// Check if either authorization method is provided
		if (!authHeader && !googApiKey) {
			return c.json(
				{
					error: {
						message: "Missing Authorization header or x-goog-api-key header",
						type: "authentication_error",
						code: "missing_authorization"
					}
				},
				401
			);
		}

		let isAuthenticated = false;

		// Check Authorization header (Bearer token)
		if (authHeader) {
			const match = authHeader.match(/^Bearer\s+(.+)$/);
			if (match) {
				const providedKey = match[1];
				if (providedKey === c.env.OPENAI_API_KEY) {
					isAuthenticated = true;
				}
			}
		}

		// Check x-goog-api-key header
		if (!isAuthenticated && googApiKey) {
			if (googApiKey === c.env.OPENAI_API_KEY) {
				isAuthenticated = true;
			}
		}

		if (!isAuthenticated) {
			return c.json(
				{
					error: {
						message: "Invalid API key",
						type: "authentication_error",
						code: "invalid_api_key"
					}
				},
				401
			);
		}

		// Optionally log successful authentication
		// console.log('API key authentication successful');
	}

	await next();
};

/**
 * Middleware to enforce API key authentication for Gemini native APIs.
 * Supports URL parameter key authentication (?key=API_KEY) in addition to header-based authentication.
 */
export const geminiApiKeyAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
	// Skip authentication for public endpoints
	const publicEndpoints = ["/", "/health"];
	if (publicEndpoints.some((endpoint) => c.req.path === endpoint)) {
		await next();
		return;
	}

	// If OPENAI_API_KEY is set in environment, require authentication
	if (c.env.OPENAI_API_KEY) {
		const authHeader = c.req.header("Authorization");
		const googApiKey = c.req.header("x-goog-api-key");
		const urlKey = c.req.query("key"); // Support URL parameter key

		// Check if any authorization method is provided
		if (!authHeader && !googApiKey && !urlKey) {
			return c.json(
				{
					error: {
						message: "Missing Authorization header, x-goog-api-key header, or key parameter",
						type: "authentication_error",
						code: "missing_authorization"
					}
				},
				401
			);
		}

		let isAuthenticated = false;

		// Check Authorization header (Bearer token)
		if (authHeader) {
			const match = authHeader.match(/^Bearer\s+(.+)$/);
			if (match) {
				const providedKey = match[1];
				if (providedKey === c.env.OPENAI_API_KEY) {
					isAuthenticated = true;
				}
			}
		}

		// Check x-goog-api-key header
		if (!isAuthenticated && googApiKey) {
			if (googApiKey === c.env.OPENAI_API_KEY) {
				isAuthenticated = true;
			}
		}

		// Check URL parameter key
		if (!isAuthenticated && urlKey) {
			if (urlKey === c.env.OPENAI_API_KEY) {
				isAuthenticated = true;
			}
		}

		if (!isAuthenticated) {
			return c.json(
				{
					error: {
						message: "Invalid API key",
						type: "authentication_error",
						code: "invalid_api_key"
					}
				},
				401
			);
		}

		// Optionally log successful authentication
		// console.log('API key authentication successful');
	}

	await next();
};
