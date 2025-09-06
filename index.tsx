import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { SettingsProvider } from './contexts/SettingsContext.tsx';
import { LogtoProvider } from '@logto/react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const logtoConfig = {
  endpoint: 'https://dg7z6l.logto.app/',
  appId: '6ggstvnner081bq4byfvk',
};

// This check is useful for development if keys are removed, but will pass with the above config.
if (logtoConfig.appId.startsWith('ENTER_YOUR_') || logtoConfig.endpoint.startsWith('ENTER_YOUR_')) {
  rootElement.innerHTML = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; color: white; background-color: #1c1c1e; border-radius: 1rem; margin: 2rem auto; border: 1px solid #333; max-width: 600px;">
      <h1 style="color: #c86187; font-size: 1.5rem; margin-bottom: 1rem;">Configuration Needed</h1>
      <p style="line-height: 1.6;">Please update the <strong>Logto configuration</strong> in the <code>index.tsx</code> file.</p>
      <p style="line-height: 1.6;">You need to replace the placeholder values for <code>appId</code> and <code>endpoint</code> with the actual credentials from your Logto application dashboard to enable authentication.</p>
    </div>
  `;
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <LogtoProvider config={logtoConfig}>
        <AuthProvider>
          <SettingsProvider>
            <App />
          </SettingsProvider>
        </AuthProvider>
      </LogtoProvider>
    </React.StrictMode>
  );
}