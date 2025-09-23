import React, { useEffect } from 'react';
import { useHandleSignInCallback } from '@logto/react';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';

const LogtoCallback = () => {
  const { isLoading, error } = useHandleSignInCallback(() => {
    // Navigate to root path when finished
    window.location.href = '/';
  });

  useEffect(() => {
    if(error) {
        console.error("Logto sign-in callback error:", error);
        // Optionally, redirect to an error page or show a message
        window.location.href = '/';
    }
  }, [error]);

  // When it's working in progress
  if (isLoading) {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-300">Finalizing login...</p>
        </div>
    );
  }

  // This part is not expected to be rendered, as the page will redirect.
  // It's here as a fallback.
  return null;
};

export default LogtoCallback;
