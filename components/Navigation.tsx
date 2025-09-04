import React from 'react';

type ActiveTab = 'home' | 'foryou' | 'watchlist' | 'movies' | 'tv' | 'collections' | 'people' | 'studios' | 'brands' | 'streaming' | 'networks' | 'game';

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
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden group
                ${
                isActive 
                ? 'bg-black/10 text-gray-900 shadow-[0_0_15px_rgba(0,0,100,0.15)]' 
                : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'
            }`}
        >
            <span className="relative z-10">{label}</span>
            {!isActive && (
                <span className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 rounded-xl transition-all duration-300"></span>
            )}
        </a>
    )
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab }) => {
  return (
    <nav className="w-full max-w-4xl p-2 glass-panel rounded-2xl">
      <div className="flex items-center justify-center flex-wrap gap-2">
        <NavLink label="Home" href="#/home" isActive={activeTab === 'home'} />
        <NavLink label="For You" href="#/foryou" isActive={activeTab === 'foryou'} />
        <NavLink label="Watchlist" href="#/watchlist" isActive={activeTab === 'watchlist'} />
        <NavLink label="Movies" href="#/movies" isActive={activeTab === 'movies'} />
        <NavLink label="TV" href="#/tv" isActive={activeTab === 'tv'} />
        <NavLink label="Coming Soon" href="#/collections" isActive={activeTab === 'collections'} />
        <NavLink label="Talent" href="#/people" isActive={activeTab === 'people'} />
        <NavLink label="CineQuiz" href="#/game" isActive={activeTab === 'game'} />
        <NavLink label="Studios" href="#/studios" isActive={activeTab === 'studios'} />
        <NavLink label="Brands" href="#/brands" isActive={activeTab === 'brands'} />
        <NavLink label="Streaming" href="#/streaming" isActive={activeTab === 'streaming'} />
        <NavLink label="Networks" href="#/networks" isActive={activeTab === 'networks'} />
      </div>
    </nav>
  );
};