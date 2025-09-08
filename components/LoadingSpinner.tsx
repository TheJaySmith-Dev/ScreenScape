import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

const TopIconSVG: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" width="100%" fill="#e3e3e3" preserveAspectRatio="xMidYMid meet">
        <path d="m140-800 74 152h130l-74-152h89l74 152h130l-74-152h89l74 152h130l-74-152h112q24 0 42 18t18 42v520q0 24-18 42t-42 18H140q-24 0-42-18t-18-42v-520q0-24 18-42t42-18Zm0 212v368h680v-368H140Zm0 0v368-368Z"/>
    </svg>
);

const BottomIconSVG: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" width="100%" fill="#e3e3e3" preserveAspectRatio="xMidYMid meet">
        <path d="M330-120v-80H140q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H630v80H330ZM140-260h680v-520H140v520Zm0 0v-520 520Z"/>
    </svg>
);

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = 'h-10 w-10' }) => {
  return (
    <div className={`relative ${className} animate-pulse-loader`}>
      {/* Top half container */}
      <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden animate-slide-in-top">
         <div className="absolute top-0 left-0 w-full h-[200%]">
            <TopIconSVG />
         </div>
      </div>

      {/* Bottom half container */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden animate-slide-in-bottom">
        <div className="absolute bottom-0 left-0 w-full h-[200%]">
            <BottomIconSVG />
        </div>
      </div>
      
      {/* Play Icon */}
      <div className="absolute inset-0 flex items-center justify-center animate-fade-in-scale">
        <img 
          src="https://img.icons8.com/?size=100&id=hfAYcPE3N8XF&format=png&color=FFFFFF" 
          alt="Loading" 
          className="w-1/3 h-1/3"
        />
      </div>
    </div>
  );
};