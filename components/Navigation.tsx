

import React from 'react';

type ActiveTab = 'home' | 'foryou' | 'watchlist' | 'movies' | 'tv' | 'collections' | 'people' | 'studios' | 'brands' | 'streaming' | 'networks' | 'game';
type NavTheme = 'dark' | 'light';

interface NavigationProps {
  activeTab: ActiveTab;
  theme?: NavTheme;
}

const NavLink: React.FC<{
    label: string;
    href: string;
    isActive: boolean;
    theme: NavTheme;
}> = ({ label, href, isActive, theme }) => {
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden group';
    
    let themeClasses = '';
    if (theme === 'light') {
        themeClasses = isActive
            ? 'bg-black/10 text-black shadow-[0_0_15px_rgba(0,0,0,0.1)]'
            : 'text-gray-700 hover:bg-black/5 hover:text-black';
    } else {
        themeClasses = isActive
            ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(100,150,255,0.15)]'
            : 'text-gray-300 hover:bg-white/5 hover:text-white';
    }

    return (
        <a href={href} className={`${baseClasses} ${themeClasses}`}>
            <span className="relative z-10">{label}</span>
            {!isActive && (
                <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 rounded-xl transition-all duration-300"></span>
            )}
        </a>
    )
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, theme = 'dark' }) => {
  const navClass = theme === 'light'
    ? 'w-full max-w-4xl p-2 bg-gray-200/80 border border-black/10 backdrop-blur-md rounded-2xl'
    : 'w-full max-w-4xl p-2 glass-panel rounded-2xl';

  return (
    <nav className={`${navClass} hidden md:flex`}>
      <div className="flex items-center justify-center flex-wrap gap-2">
        <NavLink label="Home" href="#/home" isActive={activeTab === 'home'} theme={theme} />
        <NavLink label="For You" href="#/foryou" isActive={activeTab === 'foryou'} theme={theme} />
        <NavLink label="Watchlist" href="#/watchlist" isActive={activeTab === 'watchlist'} theme={theme} />
        <NavLink label="Movies" href="#/movies" isActive={activeTab === 'movies'} theme={theme} />
        <NavLink label="TV" href="#/tv" isActive={activeTab === 'tv'} theme={theme} />
        <NavLink label="Coming Soon" href="#/collections" isActive={activeTab === 'collections'} theme={theme} />
        <NavLink label="Talent" href="#/people" isActive={activeTab === 'people'} theme={theme} />
        <NavLink label="CineQuiz" href="#/game" isActive={activeTab === 'game'} theme={theme} />
        <NavLink label="Studios" href="#/studios" isActive={activeTab === 'studios'} theme={theme} />
        <NavLink label="Brands" href="#/brands" isActive={activeTab === 'brands'} theme={theme} />
        <NavLink label="Streaming" href="#/streaming" isActive={activeTab === 'streaming'} theme={theme} />
        <NavLink label="Networks" href="#/networks" isActive={activeTab === 'networks'} theme={theme} />
      </div>
    </nav>
  );
};