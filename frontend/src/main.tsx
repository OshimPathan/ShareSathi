import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ui/ErrorBoundary'

// ─── Sentry Error Monitoring ──────────────────────────────
// To enable: npm install @sentry/react
// Then uncomment below and replace DSN with your project DSN from sentry.io
//
// import * as Sentry from '@sentry/react';
// Sentry.init({
//   dsn: import.meta.env.VITE_SENTRY_DSN || '',
//   environment: import.meta.env.MODE,
//   tracesSampleRate: 0.2,
//   replaysSessionSampleRate: 0.1,
//   replaysOnErrorSampleRate: 1.0,
//   integrations: [
//     Sentry.browserTracingIntegration(),
//     Sentry.replayIntegration(),
//   ],
// });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
