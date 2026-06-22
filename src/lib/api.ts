const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:4001";
const DEFAULT_WAKE_MAX_ATTEMPTS = Number(
  process.env.NEXT_PUBLIC_API_WAKE_MAX_ATTEMPTS ?? 12,
);
const DEFAULT_WAKE_DELAY_MS = Number(
  process.env.NEXT_PUBLIC_API_WAKE_DELAY_MS ?? 5000,
);

export function toApiUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  return response.json().catch(() => null) as Promise<T | null>;
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(toApiUrl(path), init);
  const payload = await parseJsonResponse<{ message?: string }>(response);

  if (!response.ok) {
    throw new Error(payload?.message ?? "Request failed.");
  }

  return payload as T;
}

function wait(delayMs: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
}

export async function waitForBackendWake() {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= DEFAULT_WAKE_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(toApiUrl("/wake"), {
        cache: "no-store",
      });
      const payload = await parseJsonResponse<{
        message?: string;
        status?: string;
      }>(response);

      if (response.ok && payload?.status === "ok") {
        return payload;
      }

      lastError = new Error(
        payload?.message ??
          `Backend wake request returned ${response.status}. Attempt ${attempt} of ${DEFAULT_WAKE_MAX_ATTEMPTS}.`,
      );
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Backend wake request failed.");
    }

    if (attempt < DEFAULT_WAKE_MAX_ATTEMPTS) {
      await wait(DEFAULT_WAKE_DELAY_MS);
    }
  }

  throw lastError ?? new Error("Backend did not wake up in time.");
}
