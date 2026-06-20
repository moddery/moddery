import { useEffect, useState } from 'react';

import {
  authTokenChangedEvent,
  authTokenStorageKey,
  readStoredAuthToken,
} from '../../apollo.js';

export function hasAuthToken(): boolean {
  return localStorage.getItem(authTokenStorageKey) !== null;
}

export function useAuthTokenPresent(): boolean {
  const [authenticated, setAuthenticated] = useState(hasAuthToken);

  useEffect(() => {
    function syncAuthState() {
      setAuthenticated(readStoredAuthToken() !== null);
    }

    window.addEventListener(authTokenChangedEvent, syncAuthState);
    window.addEventListener('storage', syncAuthState);

    return () => {
      window.removeEventListener(authTokenChangedEvent, syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  return authenticated;
}
