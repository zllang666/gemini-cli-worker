import { ModelInfo } from "./types";

// --- Gemini CLI Models Configuration ---
export const geminiCliModels: Record<string, ModelInfo> = {
	"gemini-2.5-pro": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 2.5 Pro model via OAuth (free tier)",
		thinking: true
	},
	"gemini-2.5-flash": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 2.5 Flash model via OAuth (free tier)",
		thinking: true
	}
};

// --- Default Model ---
export const DEFAULT_MODEL = "gemini-2.5-flash";

// --- Helper Functions ---
export function getModelInfo(modelId: string): ModelInfo | null {
	return geminiCliModels[modelId] || null;
}

export function getAllModelIds(): string[] {
	return Object.keys(geminiCliModels);
}

export function isValidModel(modelId: string): boolean {
	return modelId in geminiCliModels;
}
