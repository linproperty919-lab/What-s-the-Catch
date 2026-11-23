/**
 * The ONLY file that touches Chrome's Prompt API (Gemini Nano).
 * Docs: https://developer.chrome.com/docs/ai/prompt-api
 * Keep it thin: if the API changes shape, only this file should change.
 */
import { SYSTEM_PROMPT, TERMS_SCHEMA, type AiTerms } from './schema';
import { parseAiTerms } from './verify';

export type AiAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available' | 'unsupported';

// Minimal typing for the parts of the Prompt API we use.
interface LMSession {
  prompt(input: string, options?: { responseConstraint?: unknown; signal?: AbortSignal }): Promise<string>;
  destroy(): void;
}
interface LMStatic {
  availability(options?: unknown): Promise<Exclude<AiAvailability, 'unsupported'>>;
  create(options?: unknown): Promise<LMSession>;
}
declare global {
  // eslint-disable-next-line no-var
  var LanguageModel: LMStatic | undefined;
}

const LANG_OPTIONS = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
};

function api(): LMStatic | undefined {
  return typeof globalThis.LanguageModel === 'undefined' ? undefined : globalThis.LanguageModel;
}

export async function aiAvailability(): Promise<AiAvailability> {
  const lm = api();
  if (!lm) return 'unsupported';
  try {
    return await lm.availability(LANG_OPTIONS);
  } catch {
    return 'unavailable';
  }
}

/**
 * Create a session. If the model still needs downloading, this starts the download
 * (must be called from a user gesture the first time) and reports progress 0..1.
 */
export async function createSession(onProgress?: (fraction: number) => void): Promise<LMSession> {
  const lm = api();
  if (!lm) throw new Error('Prompt API not supported in this browser');
  return lm.create({
    ...LANG_OPTIONS,
    initialPrompts: [{ role: 'system', content: SYSTEM_PROMPT }],
    temperature: 0.2,
    topK: 3,
    monitor(m: EventTarget) {
      m.addEventListener('downloadprogress', (e) => onProgress?.((e as ProgressEvent).loaded));
    },
  });
}

/** Ask the model for structured terms. Returns null if the reply is not valid JSON of our shape. */
export async function readTerms(session: LMSession, pageText: string, signal?: AbortSignal): Promise<AiTerms | null> {
  const raw = await session.prompt(`Page text:\n"""\n${pageText}\n"""`, {
    responseConstraint: TERMS_SCHEMA,
    signal,
  });
  return parseAiTerms(raw);
}
