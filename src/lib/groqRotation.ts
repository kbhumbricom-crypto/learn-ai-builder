import { createGroq } from '@ai-sdk/groq';

// Parse available keys from environment variables
function getAvailableKeys(): string[] {
  const keys: string[] = [];
  
  if (process.env.GROQ_API_KEYS) {
    keys.push(...process.env.GROQ_API_KEYS.split(',').map(k => k.trim()).filter(Boolean));
  }
  
  if (process.env.GROQ_API_KEY && !keys.includes(process.env.GROQ_API_KEY)) {
    keys.push(process.env.GROQ_API_KEY.trim());
  }
  
  return keys.length > 0 ? keys : ['dummy-key-for-builds'];
}

const API_KEYS = getAvailableKeys();

// Track when each key will be available again (timestamp in ms)
const keyCooldowns = new Map<string, number>();

/**
 * Marks a key as rate-limited for a specific duration.
 * @param apiKey The key that was rate-limited
 * @param retryAfterSeconds How long to wait before using it again
 */
export function markKeyRateLimited(apiKey: string, retryAfterSeconds: number = 60) {
  const unblockTime = Date.now() + (retryAfterSeconds * 1000);
  keyCooldowns.set(apiKey, unblockTime);
  console.warn(`[KeyRotation] Key ending in ...${apiKey.slice(-4)} rate limited. Cooldown: ${retryAfterSeconds}s`);
}

/**
 * Returns a Groq API client initialized with the next available unthrottled key.
 * Throws an error if ALL keys are currently rate-limited.
 */
export function getAvailableGroqClient() {
  const now = Date.now();
  
  for (const key of API_KEYS) {
    const unblockTime = keyCooldowns.get(key) || 0;
    
    if (now >= unblockTime) {
      // Key is available!
      return {
        client: createGroq({ apiKey: key }),
        apiKey: key
      };
    }
  }
  
  // If we get here, EVERY key is rate-limited.
  const lowestUnblockTime = Math.min(...Array.from(keyCooldowns.values()));
  const secondsToWait = Math.ceil((lowestUnblockTime - now) / 1000);
  
  throw new Error(`ALL_KEYS_EXHAUSTED:${Math.max(1, secondsToWait)}`);
}
