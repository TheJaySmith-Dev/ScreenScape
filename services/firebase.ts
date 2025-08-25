import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Validate that all necessary Firebase config keys are present
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
    const errorMessage = `
    Firebase configuration is missing. Please create a '.env' file in the root of your project with the following keys:
    ${missingKeys.map(key => `FIREBASE_${key.toUpperCase()}`).join('\n')}

    Example .env file:
    API_KEY=your_gemini_api_key
    FIREBASE_API_KEY=your_firebase_api_key
    FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    FIREBASE_PROJECT_ID=your-project-id
    FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    FIREBASE_APP_ID=your_app_id
    `;
    // Throw an error that stops the app and is visible in the console.
    throw new Error(errorMessage);
}


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();