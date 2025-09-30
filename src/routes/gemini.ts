import { Hono } from "hono";
import { Env } from "../types";
import { AuthManager } from "../auth";
import { CODE_ASSIST_ENDPOINT, CODE_ASSIST_API_VERSION } from "../config";

/**
 * Native Gemini API routes - Forward requests directly to Gemini API
 * without any format conversion, maintaining the original Gemini API format.
 */
export const GeminiRoute = new Hono<{ Bindings: Env }>();

/**
 * List models endpoint - Returns available models in Gemini format
 */
GeminiRoute.get("/models", async (c) => {
	try {
		// Return available Gemini models in native format
		const models = [
			{
				name: "models/gemini-2.5-flash",
				version: "2.5",
				displayName: "Gemini 2.5 Flash",
				description: "Fast and efficient model optimized for speed and performance",
				inputTokenLimit: 1048576,
				outputTokenLimit: 8192,
				supportedGenerationMethods: ["generateContent", "streamGenerateContent"],
				temperature: 1.0,
				maxTemperature: 2.0,
				topP: 0.95,
				topK: 40
			},
			{
				name: "models/gemini-2.0-flash-exp",
				version: "2.0", 
				displayName: "Gemini 2.0 Flash Experimental",
				description: "Experimental version of Gemini 2.0 Flash with latest features",
				inputTokenLimit: 1048576,
				outputTokenLimit: 8192,
				supportedGenerationMethods: ["generateContent", "streamGenerateContent"],
				temperature: 1.0,
				maxTemperature: 2.0,
				topP: 0.95,
				topK: 40
			},
			{
				name: "models/gemini-1.5-pro",
				version: "1.5",
				displayName: "Gemini 1.5 Pro",
				description: "Advanced model with high capability and reasoning power",
				inputTokenLimit: 2097152,
				outputTokenLimit: 8192,
				supportedGenerationMethods: ["generateContent", "streamGenerateContent"],
				temperature: 1.0,
				maxTemperature: 2.0,
				topP: 0.95,
				topK: 40
			},
			{
				name: "models/gemini-1.5-flash",
				version: "1.5",
				displayName: "Gemini 1.5 Flash", 
				description: "Fast and efficient model with good performance balance",
				inputTokenLimit: 1048576,
				outputTokenLimit: 8192,
				supportedGenerationMethods: ["generateContent", "streamGenerateContent"],
				temperature: 1.0,
				maxTemperature: 2.0,
				topP: 0.95,
				topK: 40
			}
		];

		return c.json({
			models: models
		});
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("Models endpoint error:", errorMessage);
		return c.json({ error: errorMessage }, 500);
	}
});

/**
 * Generate content endpoint with colon syntax - /models/model:generateContent
 */
GeminiRoute.post("/models/:modelAction", async (c) => {
	try {
		const modelAction = c.req.param("modelAction");
		
		// Parse model:action format
		if (!modelAction.includes(":")) {
			// If no colon, let it fall through to the standard routes
			await c.next();
			return;
		}
		
		const [model, action] = modelAction.split(":");
		
		// Only handle generateContent and streamGenerateContent actions
		if (action !== "generateContent" && action !== "streamGenerateContent") {
			await c.next();
			return;
		}
		
		const requestBody = await c.req.json();

		console.log("Native Gemini generate content request (colon syntax):", { model, action, requestBody });

		const authManager = new AuthManager(c.env);
		await authManager.initializeAuth();

		// Discover project ID if needed
		const projectId = await discoverProjectId(authManager, c.env);

		// Log Google Search tool detection
		if (requestBody.tools && requestBody.tools.some((tool: { googleSearch?: unknown }) => tool.googleSearch)) {
			console.log("Google Search tool detected in request");
		}

		// Use the original Code Assist API format that works
		const geminiRequest = {
			model: model,
			project: projectId,
			request: requestBody
		};

		// Handle streaming vs non-streaming based on action
		const isStreaming = action === "streamGenerateContent";
		const endpoint = isStreaming 
			? `${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:streamGenerateContent?alt=sse`
			: `${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:generateContent`;

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${authManager.getAccessToken()}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(geminiRequest)
		});

		if (!response.ok) {
			if (response.status === 401) {
				console.log("Got 401 error, clearing token cache and retrying...");
				await authManager.clearTokenCache();
				await authManager.initializeAuth();

				// Retry the request
				const retryResponse = await fetch(endpoint, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${authManager.getAccessToken()}`,
						"Content-Type": "application/json"
					},
					body: JSON.stringify(geminiRequest)
				});

				if (!retryResponse.ok) {
					const errorText = await retryResponse.text();
					console.error(`Generate content retry failed: ${retryResponse.status}`, errorText);
					return c.json({ error: `Generate content failed: ${retryResponse.status}`, details: errorText }, retryResponse.status);
				}

				if (isStreaming) {
					return new Response(retryResponse.body, {
						headers: {
							"Content-Type": "text/event-stream",
							"Cache-Control": "no-cache",
							Connection: "keep-alive",
							"Access-Control-Allow-Origin": "*",
							"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
							"Access-Control-Allow-Headers": "Content-Type, Authorization, x-goog-api-key"
						}
					});
				} else {
					const data = await retryResponse.json();
					return c.json(data);
				}
			}

			const errorText = await response.text();
			console.error(`Generate content failed: ${response.status}`, errorText);
			return c.json({ error: `Generate content failed: ${response.status}`, details: errorText }, response.status);
		}

		if (isStreaming) {
			if (!response.body) {
				throw new Error("Response has no body");
			}

			// Return the streaming response directly without modification
			return new Response(response.body, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type, Authorization, x-goog-api-key"
				}
			});
		} else {
			const data = await response.json();
			return c.json(data);
		}
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("Generate content error (colon syntax):", errorMessage);
		return c.json({ error: errorMessage }, 500);
	}
});

/**
 * Generate content endpoint - Forward non-streaming requests to Gemini API
 * Supports both formats: /models/:model/generateContent and /models/:model:generateContent
 */
GeminiRoute.post("/models/:model/generateContent", async (c) => {
	try {
		const model = c.req.param("model");
		const requestBody = await c.req.json();

		console.log("Native Gemini generate content request:", { model, requestBody });

		const authManager = new AuthManager(c.env);
		await authManager.initializeAuth();

		// Discover project ID if needed
		const projectId = await discoverProjectId(authManager, c.env);

		// Log Google Search tool detection
		if (requestBody.tools && requestBody.tools.some((tool: { googleSearch?: unknown }) => tool.googleSearch)) {
			console.log("Google Search tool detected in request");
		}

		// Use the original Code Assist API format that works
		const geminiRequest = {
			model: model,
			project: projectId,
			request: requestBody
		};

		const response = await fetch(`${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:generateContent`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${authManager.getAccessToken()}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(geminiRequest)
		});

		if (!response.ok) {
			if (response.status === 401) {
				console.log("Got 401 error, clearing token cache and retrying...");
				await authManager.clearTokenCache();
				await authManager.initializeAuth();

				// Retry the request
				const retryResponse = await fetch(`${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:generateContent`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${authManager.getAccessToken()}`,
						"Content-Type": "application/json"
					},
					body: JSON.stringify(geminiRequest)
				});

				if (!retryResponse.ok) {
					const errorText = await retryResponse.text();
					console.error(`Generate content retry failed: ${retryResponse.status}`, errorText);
					return c.json({ error: `Generate content failed: ${retryResponse.status}`, details: errorText }, retryResponse.status);
				}

				const data = await retryResponse.json();
				return c.json(data);
			}

			const errorText = await response.text();
			console.error(`Generate content failed: ${response.status}`, errorText);
			return c.json({ error: `Generate content failed: ${response.status}`, details: errorText }, response.status);
		}

		const data = await response.json();
		return c.json(data);
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("Generate content error:", errorMessage);
		return c.json({ error: errorMessage }, 500);
	}
});

/**
 * Stream generate content endpoint - Forward streaming requests to Gemini API
 */
GeminiRoute.post("/models/:model/streamGenerateContent", async (c) => {
	try {
		const model = c.req.param("model");
		const requestBody = await c.req.json();

		console.log("Native Gemini stream generate content request:", { model, requestBody });

		const authManager = new AuthManager(c.env);
		await authManager.initializeAuth();

		// Discover project ID if needed
		const projectId = await discoverProjectId(authManager, c.env);

		// Use the original Code Assist API format for streaming
		const geminiRequest = {
			model: model,
			project: projectId,
			request: requestBody
		};

		const response = await fetch(`${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:streamGenerateContent?alt=sse`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${authManager.getAccessToken()}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(geminiRequest)
		});

		if (!response.ok) {
			if (response.status === 401) {
				console.log("Got 401 error in stream request, clearing token cache and retrying...");
				await authManager.clearTokenCache();
				await authManager.initializeAuth();

				// Retry the request
				const retryResponse = await fetch(`${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:streamGenerateContent?alt=sse`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${authManager.getAccessToken()}`,
						"Content-Type": "application/json"
					},
					body: JSON.stringify(geminiRequest)
				});

				if (!retryResponse.ok) {
					const errorText = await retryResponse.text();
					console.error(`Stream generate content retry failed: ${retryResponse.status}`, errorText);
					return c.json({ error: `Stream generate content failed: ${retryResponse.status}` }, retryResponse.status);
				}

				// Return the streaming response directly
				return new Response(retryResponse.body, {
					headers: {
						"Content-Type": "text/event-stream",
						"Cache-Control": "no-cache",
						Connection: "keep-alive",
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type, Authorization, x-goog-api-key"
					}
				});
			}

			const errorText = await response.text();
			console.error(`Stream generate content failed: ${response.status}`, errorText);
			return c.json({ error: `Stream generate content failed: ${response.status}` }, response.status);
		}

		if (!response.body) {
			throw new Error("Response has no body");
		}

		// Return the streaming response directly without modification
		return new Response(response.body, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization"
			}
		});
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("Stream generate content error:", errorMessage);
		return c.json({ error: errorMessage }, 500);
	}
});

/**
 * Google Search tool test endpoint - Demonstrates Google Search functionality
 */
GeminiRoute.post("/search-test", async (c) => {
	try {
		const { query } = await c.req.json();
		
		if (!query) {
			return c.json({ error: "Query parameter is required" }, 400);
		}

		console.log("Google Search test request:", { query });

		const authManager = new AuthManager(c.env);
		await authManager.initializeAuth();

		// Discover project ID if needed
		const projectId = await discoverProjectId(authManager, c.env);

		// Create a request with Google Search tool using correct format
		const searchRequest = {
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `Search for information about: ${query}. Please provide a comprehensive summary of what you find.`
						}
					]
				}
			],
			tools: [
				{
					googleSearch: {}
				}
			],
			generationConfig: {
				temperature: 0.3,
				maxOutputTokens: 2048
			}
		};

		// Use original Code Assist API format for search test
		const searchRequestWrapped = {
			model: "gemini-2.5-flash",
			project: projectId,
			request: searchRequest
		};

		const response = await fetch(`${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:generateContent`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${authManager.getAccessToken()}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(searchRequestWrapped)
		});

		if (!response.ok) {
			if (response.status === 401) {
				console.log("Got 401 error, clearing token cache and retrying...");
				await authManager.clearTokenCache();
				await authManager.initializeAuth();

				// Retry the request
				const retryResponse = await fetch(`${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:generateContent`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${authManager.getAccessToken()}`,
						"Content-Type": "application/json"
					},
					body: JSON.stringify(searchRequestWrapped)
				});

				if (!retryResponse.ok) {
					const errorText = await retryResponse.text();
					console.error(`Search test retry failed: ${retryResponse.status}`, errorText);
					return c.json({ error: `Search test failed: ${retryResponse.status}`, details: errorText }, retryResponse.status);
				}

				const data = await retryResponse.json();
				return c.json(data);
			}

			const errorText = await response.text();
			console.error(`Search test failed: ${response.status}`, errorText);
			return c.json({ error: `Search test failed: ${response.status}`, details: errorText }, response.status);
		}

		const data = await response.json();
		return c.json(data);
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("Search test error:", errorMessage);
		return c.json({ error: errorMessage }, 500);
	}
});

/**
 * Generic proxy endpoint for other Gemini API endpoints
 */
GeminiRoute.all("/*", async (c) => {
	try {
		const path = c.req.path;
		const method = c.req.method;
		
		console.log("Generic Gemini proxy request:", { method, path });

		const authManager = new AuthManager(c.env);
		await authManager.initializeAuth();

		const url = `${CODE_ASSIST_ENDPOINT}${path}${c.req.url.includes("?") ? "&" : "?"}alt=sse`;
		
		let body;
		if (method !== "GET" && method !== "HEAD") {
			body = await c.req.text();
		}

		const response = await fetch(url, {
			method,
			headers: {
				Authorization: `Bearer ${authManager.getAccessToken()}`,
				"Content-Type": "application/json"
			},
			body: body
		});

		if (!response.ok) {
			if (response.status === 401) {
				console.log("Got 401 error in generic proxy, clearing token cache and retrying...");
				await authManager.clearTokenCache();
				await authManager.initializeAuth();

				// Retry the request
				const retryResponse = await fetch(url, {
					method,
					headers: {
						Authorization: `Bearer ${authManager.getAccessToken()}`,
						"Content-Type": "application/json"
					},
					body: body
				});

				if (!retryResponse.ok) {
					const errorText = await retryResponse.text();
					console.error(`Generic proxy retry failed: ${retryResponse.status}`, errorText);
					return c.json({ error: `Proxy request failed: ${retryResponse.status}` }, retryResponse.status);
				}

				// Handle both streaming and non-streaming responses
				if (retryResponse.headers.get("content-type")?.includes("text/event-stream")) {
					return new Response(retryResponse.body, {
						headers: {
							"Content-Type": "text/event-stream",
							"Cache-Control": "no-cache",
							Connection: "keep-alive",
							"Access-Control-Allow-Origin": "*",
							"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
							"Access-Control-Allow-Headers": "Content-Type, Authorization, x-goog-api-key"
						}
					});
				} else {
					const data = await retryResponse.json();
					return c.json(data);
				}
			}

			const errorText = await response.text();
			console.error(`Generic proxy failed: ${response.status}`, errorText);
			return c.json({ error: `Proxy request failed: ${response.status}` }, response.status);
		}

		// Handle both streaming and non-streaming responses
		if (response.headers.get("content-type")?.includes("text/event-stream")) {
			return new Response(response.body, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type, Authorization"
				}
			});
		} else {
			const data = await response.json();
			return c.json(data);
		}
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("Generic proxy error:", errorMessage);
		return c.json({ error: errorMessage }, 500);
	}
});

/**
 * Helper function to discover project ID
 */
async function discoverProjectId(authManager: AuthManager, env: Env): Promise<string> {
	if (env.GEMINI_PROJECT_ID) {
		return env.GEMINI_PROJECT_ID;
	}

	try {
		const initialProjectId = "default-project";
		const loadResponse = await authManager.callEndpoint("loadCodeAssist", {
			cloudaicompanionProject: initialProjectId,
			metadata: { duetProject: initialProjectId }
		}) as { cloudaicompanionProject?: string };

		if (loadResponse.cloudaicompanionProject) {
			return loadResponse.cloudaicompanionProject;
		}
		throw new Error("Project ID discovery failed. Please set the GEMINI_PROJECT_ID environment variable.");
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("Failed to discover project ID:", errorMessage);
		throw new Error(
			"Could not discover project ID. Make sure you're authenticated and consider setting GEMINI_PROJECT_ID."
		);
	}
}