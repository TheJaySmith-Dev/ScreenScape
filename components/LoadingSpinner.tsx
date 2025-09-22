import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = 'h-12 w-12' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="https://i.ibb.co/W4QG4kFf/A221491-C-929-D-44-DD-9-D09-97163-D81-EB61.png"
        alt="Loading..."
        className="w-full h-full animate-pulse"
      />
    </div>
  );
};
