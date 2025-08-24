

import React from 'react';

type ActiveTab = 'home' | 'movies' | 'tv' | 'series' | 'studios';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex-shrink-0 px-3 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                isActive 
                ? 'bg-white text-gray-900' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
        >
            {label}
        </button>
    )
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="w-full max-w-md p-1.5 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full">
      <div className="flex items-center justify-center space-x-1">
        <NavButton label="Home" isActive={activeTab === 'home'} onClick={() => onTabChange('home')} />
        <NavButton label="Movies" isActive={activeTab === 'movies'} onClick={() => onTabChange('movies')} />
        <NavButton label="TV" isActive={activeTab === 'tv'} onClick={() => onTabChange('tv')} />
        <NavButton label="Series" isActive={activeTab === 'series'} onClick={() => onTabChange('series')} />
        <NavButton label="Studios" isActive={activeTab === 'studios'} onClick={() => onTabChange('studios')} />
      </div>
    </nav>
  );
};
