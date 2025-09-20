import React from 'react';
import type { MediaDetails } from '../types.ts';

// This component has been deprecated. The "For You" recommendations
// are now handled directly on the homepage within App.tsx and are
// powered by the TMDb API, not Gemini. This file is kept to prevent
// breaking any potential lingering imports but its functionality
// has been removed to ensure no Gemini API credits are used.

interface ForYouPageProps {
  onSelectMedia: (media: MediaDetails) => void;
}

export const ForYouPage: React.FC<ForYouPageProps> = () => {
  return null; // Render nothing
};
