
import React, { useEffect } from 'react';
import { SearchBar } from './SearchBar.tsx';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSearch, isLoading }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
          window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-24 ai-search-modal-bg fade-in" 
            style={{ animationDuration: '300ms' }}
            onClick={onClose}
        >
            <div 
                className="w-full max-w-lg fade-in-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <SearchBar onSearch={onSearch} isLoading={isLoading} theme="light" autoFocus={true} />
            </div>
        </div>
    );
};
