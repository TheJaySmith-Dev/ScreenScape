import React from 'react';

type ActiveTab = 'home' | 'foryou' | 'watchlist' | 'movies' | 'tv' | 'collections' | 'studios' | 'brands' | 'streaming' | 'networks';

interface NavigationProps {
  activeTab: ActiveTab;
}

const NavLink: React.FC<{
    label: string;
    href: string;
    isActive: boolean;
}> = ({ label, href, isActive }) => {
    return (
        <a
            href={href}
            className={`px-3 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                isActive 
                ? 'bg-white text-gray-900' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
        >
            {label}
        </a>
    )
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab }) => {
  return (
    <nav className="w-full max-w-2xl p-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl">
      <div className="flex items-center justify-center flex-wrap gap-2">
        <NavLink label="Home" href="#/home" isActive={activeTab === 'home'} />
        <NavLink label="For You" href="#/foryou" isActive={activeTab === 'foryou'} />
        <NavLink label="Watchlist" href="#/watchlist" isActive={activeTab === 'watchlist'} />
        <NavLink label="Movies" href="#/movies" isActive={activeTab === 'movies'} />
        <NavLink label="TV" href="#/tv" isActive={activeTab === 'tv'} />
        <NavLink label="Coming Soon" href="#/collections" isActive={activeTab === 'collections'} />
        <NavLink label="Studios" href="#/studios" isActive={activeTab === 'studios'} />
        <NavLink label="Brands" href="#/brands" isActive={activeTab === 'brands'} />
        <NavLink label="Streaming" href="#/streaming" isActive={activeTab === 'streaming'} />
        <NavLink label="Networks" href="#/networks" isActive={activeTab === 'networks'} />
      </div>
    </nav>
  );
};