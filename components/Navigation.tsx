import React from 'react';

type ActiveTab = 'home' | 'foryou' | 'movies' | 'tv' | 'collections' | 'studios' | 'brands';

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
            className={`px-3 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
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
    <nav className="w-full max-w-lg p-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl">
      <div className="flex items-center justify-center flex-wrap gap-2">
        <NavButton label="Home" isActive={activeTab === 'home'} onClick={() => onTabChange('home')} />
        <NavButton label="For You" isActive={activeTab === 'foryou'} onClick={() => onTabChange('foryou')} />
        <NavButton label="Movies" isActive={activeTab === 'movies'} onClick={() => onTabChange('movies')} />
        <NavButton label="TV" isActive={activeTab === 'tv'} onClick={() => onTabChange('tv')} />
        <NavButton label="Collections" isActive={activeTab === 'collections'} onClick={() => onTabChange('collections')} />
        <NavButton label="Studios" isActive={activeTab === 'studios'} onClick={() => onTabChange('studios')} />
        <NavButton label="Brands" isActive={activeTab === 'brands'} onClick={() => onTabChange('brands')} />
      </div>
    </nav>
  );
};