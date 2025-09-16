
import React, { useEffect } from 'react';
import { CloseIcon } from './icons.tsx';

interface BrowseMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuLink: React.FC<{ href: string; label: string; onClick: () => void; }> = ({ href, label, onClick }) => (
    <a 
        href={href} 
        onClick={onClick}
        className="block p-4 text-lg text-gray-200 font-semibold border-b border-white/10 hover:bg-white/5 transition-colors"
    >
        {label}
    </a>
);

export const BrowseMenuModal: React.FC<BrowseMenuModalProps> = ({ isOpen, onClose }) => {
    useEffect(() => {
        if (isOpen) {
          document.body.classList.add('modal-open');
        } else {
          document.body.classList.remove('modal-open');
        }
        return () => {
          document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[100] fade-in" 
            onClick={onClose}
        >
            <div 
                className="w-full h-full flex flex-col pt-12"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 pb-4">
                    <h2 className="text-2xl font-bold text-white">Browse</h2>
                    <button onClick={onClose} className="p-2 glass-panel rounded-full" aria-label="Close menu">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <nav className="flex-grow overflow-y-auto">
                    <MenuLink href="#/movies" label="Movies" onClick={onClose} />
                    <MenuLink href="#/tv" label="TV Shows" onClick={onClose} />
                    <MenuLink href="#/collections" label="Coming Soon" onClick={onClose} />
                    <MenuLink href="#/people" label="Talent" onClick={onClose} />
                    <MenuLink href="#/studios" label="Studios" onClick={onClose} />
                    <MenuLink href="#/brands" label="Brands" onClick={onClose} />
                    <MenuLink href="#/streaming" label="Streaming" onClick={onClose} />
                    <MenuLink href="#/networks" label="Networks" onClick={onClose} />
                </nav>
            </div>
        </div>
    );
};
