export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

interface FetchOptions extends RequestInit {
  token?: string | null;
}

export async function apiFetch<T = unknown>(path: string, { token, headers, ...options }: FetchOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch {
      // ignore json parse errors
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
