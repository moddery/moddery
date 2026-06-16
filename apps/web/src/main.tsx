import { StrictMode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { apolloClient } from './apollo.js';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </QueryClientProvider>
    </ApolloProvider>
  </StrictMode>,
);
