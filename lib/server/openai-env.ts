import "server-only";

export function getOpenAiApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (typeof apiKey !== "string") {
    return "";
  }

  const normalized = apiKey.trim();

  return normalized && normalized !== "your_api_key_here" ? normalized : "";
}

export function hasOpenAiApiKey() {
  return getOpenAiApiKey().length > 0;
}
