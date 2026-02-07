export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const memoryTokens: Partial<AuthTokens> = {};
const storageKey = "opsync.tokens";

function hasWindow() {
  return typeof window !== "undefined";
}

export function getTokens(): Partial<AuthTokens> {
  if (memoryTokens.accessToken || memoryTokens.refreshToken) {
    return { ...memoryTokens };
  }
  if (hasWindow()) {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<AuthTokens>;
        memoryTokens.accessToken = parsed.accessToken;
        memoryTokens.refreshToken = parsed.refreshToken;
        return { ...parsed };
      } catch {
        return {};
      }
    }
  }
  return {};
}

export function setTokens(tokens: AuthTokens) {
  memoryTokens.accessToken = tokens.accessToken;
  memoryTokens.refreshToken = tokens.refreshToken;
  if (hasWindow()) {
    window.localStorage.setItem(storageKey, JSON.stringify(tokens));
  }
}

export function clearTokens() {
  memoryTokens.accessToken = undefined;
  memoryTokens.refreshToken = undefined;
  if (hasWindow()) {
    window.localStorage.removeItem(storageKey);
  }
}

export function hasAccessToken() {
  return Boolean(getTokens().accessToken);
}
