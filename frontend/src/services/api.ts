/// <reference types="vite/client" />
import { BuildResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

async function postJson<T>(path: string, body: object): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { detail?: string } | null;
      throw new Error(data?.detail ?? `Server returned error ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Unable to connect to the backend at ${API_BASE_URL}. Please ensure the backend is running and reachable.`);
    }
    throw error;
  }
}

export function buildProject(idea: string): Promise<BuildResponse> {
  return postJson<BuildResponse>('/build', { idea });
}

export function modifyProject(sessionId: string, instruction: string): Promise<BuildResponse> {
  return postJson<BuildResponse>('/modify', { session_id: sessionId, instruction });
}

export function getSession(sessionId: string): Promise<BuildResponse | null> {
  return fetch(`${API_BASE_URL}/sessions/${sessionId}`)
    .then(res => res.ok ? res.json() : null);
}

export function streamSession(
  sessionId: string,
  onUpdate: (build: BuildResponse) => void,
  onError?: () => void
): EventSource {
  const source = new EventSource(`${API_BASE_URL}/sessions/${sessionId}/stream`);

  source.addEventListener('update', (event) => {
    try {
      const parsed = JSON.parse((event as MessageEvent).data) as BuildResponse;
      onUpdate(parsed);
    } catch (error) {
      console.error('Failed to parse stream update:', error);
    }
  });

  source.addEventListener('end', () => {
    source.close();
  });

  source.onerror = () => {
    source.close();
    onError?.();
  };

  return source;
}

export async function getHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
