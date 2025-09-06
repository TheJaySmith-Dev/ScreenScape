import React from 'react';
import { useHandleSignInCallback } from '@logto/react';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';

const Callback = () => {
  const navigateToHome = () => {
    // Using hash routing to navigate to the home page
    window.location.hash = '/home';
    // A full reload might be good here to ensure all contexts are updated
    window.location.reload();
  };

  const { isLoading, error } = useHandleSignInCallback(navigateToHome);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-400">
        <h1 className="text-2xl font-bold mb-4">Sign-in Error</h1>
        <p>{error.message}</p>
        <a href="#/home" className="mt-4 px-4 py-2 bg-white/10 rounded-lg">Go to Home</a>
      </div>
    );
  }

  // When it's working in progress
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <LoadingSpinner className="w-16 h-16" />
            <p className="mt-4 text-lg">Finalizing sign-in...</p>
        </div>
    );
  }

  // The hook handles navigation, so this component shouldn't render anything on success.
  return null;
};

export default Callback;