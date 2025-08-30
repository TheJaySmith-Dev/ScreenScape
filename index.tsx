import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Auth0Provider } from '@auth0/auth0-react';

// --- Auth0 Configuration ---
const auth0Domain = 'thejaysmith1.us.auth0.com';
const auth0ClientId = 'IXdcDi6pOhltKzt7htPp1RP8uE7cpAnx';
const auth0Audience = 'api.thejaysmith.net';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: auth0Audience,
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);