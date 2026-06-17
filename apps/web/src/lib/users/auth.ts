import { authTokenStorageKey } from '../../apollo.js';

export function hasAuthToken(): boolean {
  return localStorage.getItem(authTokenStorageKey) !== null;
}
