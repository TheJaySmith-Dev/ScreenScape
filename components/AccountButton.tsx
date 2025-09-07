import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { useSettings } from '../hooks/useSettings.ts';
import { UserIcon, GlobeIcon, SparklesIcon } from './icons.tsx';
import type { UserLocation } from '../types.ts';

interface AccountButtonProps {
    userLocation: UserLocation | null;
    theme?: 'dark' | 'light';
}

export const AccountButton: React.FC<AccountButtonProps> = ({ userLocation, theme = 'dark' }) => {
    const { currentUser, login, logout, loading } = useAuth();
    const { rateLimit } = useSettings();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const dropdownClass = theme === 'light'
        ? 'absolute top-full right-0 mt-2 w-64 bg-gray-200/80 border border-black/10 backdrop-blur-md rounded-2xl shadow-lg z-50 fade-in'
        : 'absolute top-full right-0 mt-2 w-64 glass-panel rounded-2xl shadow-lg z-50 fade-in';
    
    const textPrimaryClass = theme === 'light' ? 'text-black' : 'text-white';
    const textSecondaryClass = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
    const borderClass = theme === 'light' ? 'border-black/10' : 'border-white/10';

    if (loading) {
        return (
             <div className="w-9 h-9 bg-gray-700/50 rounded-full animate-pulse"></div>
        )
    }

    if (!currentUser) {
        return (
            <button
                onClick={() => login()}
                className="p-2 glass-panel rounded-full hover:bg-white/5 transition-colors"
                aria-label="Sign In"
            >
                <UserIcon className="w-5 h-5 text-white" />
            </button>
        );
    }

    const photoURL = currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=4b5563&color=e5e7eb&rounded=true`;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="flex items-center gap-2 p-1 glass-panel rounded-full font-semibold transition-all duration-300 hover:bg-white/5 hover:scale-105"
            >
                {photoURL ? (
                    <img src={photoURL} alt="User" className="w-9 h-9 rounded-full" />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                    </div>
                )}
            </button>

            {isMenuOpen && (
                <div className={dropdownClass} style={{ animationDuration: '200ms' }}>
                    <div className={`p-4 border-b ${borderClass}`}>
                        <p className={`font-semibold truncate ${textPrimaryClass}`}>{currentUser.displayName || 'User'}</p>
                        <p className={`text-sm truncate ${textSecondaryClass}`}>{currentUser.email || 'No email provided'}</p>
                    </div>
                    {userLocation?.name && (
                        <div className={`p-4 flex items-center gap-2 text-sm border-b ${borderClass} ${textSecondaryClass}`}>
                            <GlobeIcon className="w-4 h-4" />
                            <span>{userLocation.name}</span>
                        </div>
                    )}
                    <div className={`p-4 flex items-center justify-between text-sm border-b ${borderClass} ${textSecondaryClass}`}>
                        <div className="flex items-center gap-2">
                           <SparklesIcon className="w-4 h-4 text-indigo-400" />
                           <span>Today's AI Usage</span>
                        </div>
                        <span className="font-semibold text-white">{rateLimit.count} / 500</span>
                    </div>
                    <div className="p-2">
                         <button
                            onClick={handleLogout}
                            className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${theme === 'light' ? 'text-red-600 hover:bg-black/5' : 'text-red-400 hover:bg-white/5'}`}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};