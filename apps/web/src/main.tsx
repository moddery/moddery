import { ApolloProvider } from '@apollo/client';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.js';
import './styles.css';
import { apolloClient } from './apollo.js';

const root = document.getElementById('root');

if (root === null) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
);
