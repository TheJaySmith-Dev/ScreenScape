
import React from 'react';

type ActiveTab = 'home' | 'movies' | 'tv' | 'collections' | 'studios';

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
            className={`flex-shrink-0 px-4 py-2 text-sm md:text-base font-semibold rounded-full transition-colors duration-300 ${
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
      <div className="media-row flex items-center justify-start sm:justify-center overflow-x-auto space-x-2">
        <NavButton label="Home" isActive={activeTab === 'home'} onClick={() => onTabChange('home')} />
        <NavButton label="Movies" isActive={activeTab === 'movies'} onClick={() => onTabChange('movies')} />
        <NavButton label="TV" isActive={activeTab === 'tv'} onClick={() => onTabChange('tv')} />
        <NavButton label="Collections" isActive={activeTab === 'collections'} onClick={() => onTabChange('collections')} />
        <NavButton label="Studios" isActive={activeTab === 'studios'} onClick={() => onTabChange('studios')} />
      </div>
    </nav>
  );
};
