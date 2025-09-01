
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { UserIcon, GlobeIcon } from './icons.tsx';
import type { UserLocation } from '../types.ts';

interface AccountButtonProps {
    onSignInClick: () => void;
    userLocation: UserLocation | null;
}

export const AccountButton: React.FC<AccountButtonProps> = ({ onSignInClick, userLocation }) => {
    const { currentUser, logout } = useAuth();
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

    if (!currentUser) {
        return (
            <button
                onClick={onSignInClick}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-semibold transition-colors duration-300"
            >
                <UserIcon className="w-5 h-5" />
                <span>Sign In</span>
            </button>
        );
    }

    const photoURL = currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName)}&background=374151&color=fff`;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="flex items-center gap-2 p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-semibold transition-colors duration-300"
            >
                {photoURL ? (
                    <img src={photoURL} alt="User" className="w-8 h-8 rounded-full" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <UserIcon className="w-5 h-5" />
                    </div>
                )}
            </button>

            {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50 fade-in" style={{ animationDuration: '200ms', opacity: 0 }}>
                    <div className="p-4 border-b border-white/10">
                        <p className="font-semibold truncate">{currentUser.displayName || 'User'}</p>
                        <p className="text-sm text-gray-400 truncate">{currentUser.email}</p>
                    </div>
                    {userLocation?.name && (
                        <div className="p-4 flex items-center gap-2 text-sm text-gray-300 border-b border-white/10">
                            <GlobeIcon className="w-4 h-4" />
                            <span>{userLocation.name}</span>
                        </div>
                    )}
                    <div className="p-2">
                         <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 rounded-md transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
