

import React from 'react';
import { HomeIcon, UserIcon, SearchIcon, SparklesIcon, GridIcon } from './icons.tsx';

type ActiveTab = 'home' | 'foryou' | 'myscape' | 'game';

interface MobileNavigationProps {
  activeTab: string;
  onSearchClick: () => void;
  onMoreClick: () => void;
}

const NavItem: React.FC<{
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}> = ({ href, icon, label, isActive }) => (
  <a href={href} className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}>
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </a>
);

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, onSearchClick, onMoreClick }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/50 backdrop-blur-lg border-t border-white/10 z-50">
      <div className="w-full h-full grid grid-cols-5">
        <NavItem href="#/home" icon={<HomeIcon className="w-6 h-6" />} label="Home" isActive={activeTab === 'home'} />
        <NavItem href="#/foryou" icon={<SparklesIcon className="w-6 h-6" />} label="For You" isActive={activeTab === 'foryou'} />
        <NavItem href="#/myscape" icon={<UserIcon className="w-6 h-6" />} label="MyScape" isActive={activeTab === 'myscape'} />
        <button onClick={onSearchClick} className="flex flex-col items-center justify-center gap-1 w-full h-full text-gray-400 hover:text-white">
          <SearchIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Search</span>
        </button>
        <button onClick={onMoreClick} className="flex flex-col items-center justify-center gap-1 w-full h-full text-gray-400 hover:text-white">
          <GridIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Browse</span>
        </button>
      </div>
    </nav>
  );
};