import { authTokenStorageKey } from '../../../apollo.js';

export function hasAuthToken(): boolean {
  return localStorage.getItem(authTokenStorageKey) !== null;
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted === true) {
    throw new DOMException('Request aborted', 'AbortError');
  }
}
