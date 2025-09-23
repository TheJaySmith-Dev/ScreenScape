import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { SettingsProvider } from './contexts/SettingsContext.tsx';
import { LogtoProvider, type LogtoConfig } from '@logto/react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const config: LogtoConfig = {
    endpoint: 'https://qrd6i9.logto.app/',
    appId: 'mkb9ruywcb1z97g3trf84',
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LogtoProvider config={config}>
        <SettingsProvider>
            <App />
        </SettingsProvider>
    </LogtoProvider>
  </React.StrictMode>
);
