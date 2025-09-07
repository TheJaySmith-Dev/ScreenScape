
import React from 'react';
import { HomeIcon, UserIcon, ThumbsUpIcon, SearchIcon, SparklesIcon } from './icons.tsx';

type ActiveTab = 'home' | 'foryou' | 'watchlist' | 'game';

interface MobileNavigationProps {
  activeTab: ActiveTab;
  onSearchClick: () => void;
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

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, onSearchClick }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/50 backdrop-blur-lg border-t border-white/10 z-50">
      <div className="w-full h-full grid grid-cols-5">
        <NavItem href="#/home" icon={<HomeIcon className="w-6 h-6" />} label="Home" isActive={activeTab === 'home'} />
        <NavItem href="#/foryou" icon={<SparklesIcon className="w-6 h-6" />} label="For You" isActive={activeTab === 'foryou'} />
        <NavItem href="#/watchlist" icon={<ThumbsUpIcon className="w-6 h-6" />} label="Watchlist" isActive={activeTab === 'watchlist'} />
        <button onClick={onSearchClick} className="flex flex-col items-center justify-center gap-1 w-full h-full text-gray-400 hover:text-white">
          <SearchIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Search</span>
        </button>
        <NavItem href="#/game" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h.041a1.5 1.5 0 0 0 1.459-1.5V3.5A1.5 1.5 0 0 0 15.5 2Zm-5 0A1.5 1.5 0 0 0 9 3.5v13a1.5 1.5 0 0 0 1.5 1.5h.041a1.5 1.5 0 0 0 1.459-1.5V3.5A1.5 1.5 0 0 0 10.5 2Zm-5 0A1.5 1.5 0 0 0 4 3.5v13a1.5 1.5 0 0 0 1.5 1.5h.041a1.5 1.5 0 0 0 1.459-1.5V3.5A1.5 1.5 0 0 0 5.5 2Z" clipRule="evenodd" /></svg>} label="CineQuiz" isActive={activeTab === 'game'} />
      </div>
    </nav>
  );
};
      