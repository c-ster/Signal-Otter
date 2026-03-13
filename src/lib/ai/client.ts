import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-sonnet-4-20250514";
export const DEFAULT_MAX_TOKENS = 4096;
export const LONG_MAX_TOKENS = 8192;

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local to enable AI generation."
    );
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export function isAIConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY || shouldUseMock();
}

export function shouldUseMock(): boolean {
  return process.env.AI_MOCK_MODE === "true";
}

export async function callClaude(
  system: string,
  user: string,
  maxTokens: number = DEFAULT_MAX_TOKENS
): Promise<string> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }
  return textBlock.text;
}

/**
 * Extract JSON from Claude's response, handling ```json code fences
 */
export function extractJSON(text: string): unknown {
  // Try to extract from code fences first
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenceMatch) {
    return JSON.parse(fenceMatch[1].trim());
  }
  // Try parsing the whole text
  return JSON.parse(text.trim());
}
