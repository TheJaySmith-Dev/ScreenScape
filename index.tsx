import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { SettingsProvider } from './contexts/SettingsContext.tsx';

// Pre-mount routing logic for TMDb callback
const params = new URLSearchParams(window.location.search);
const isTmdbCallback = params.get('approved') === 'true' && params.get('request_token');

if (isTmdbCallback) {
    const requestToken = params.get('request_token');
    const newUrl = `${window.location.pathname}#/callback/tmdb?request_token=${requestToken}&approved=true`;
    // Use replace to avoid polluting the browser history with the intermediate step
    window.location.replace(newUrl);
} else {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Could not find root element to mount to");
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </React.StrictMode>
    );
}
