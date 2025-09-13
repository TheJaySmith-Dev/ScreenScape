import React, { useEffect } from 'react';
import type { MediaDetails } from '../types.ts';
import { CloseIcon, MoneyIcon } from './icons.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface BoxOfficeAnalysisModalProps {
    media: MediaDetails;
    isOpen: boolean;
    onClose: () => void;
    analysis: { headline: string; report: string } | null;
    isLoading: boolean;
    error: string | null;
}

export const BoxOfficeAnalysisModal: React.FC<BoxOfficeAnalysisModalProps> = ({ media, isOpen, onClose, analysis, isLoading, error }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center text-center h-64">
                    <LoadingSpinner className="w-12 h-12" />
                    <p className="mt-4 text-lg text-gray-300">Analyzing the numbers...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-8">
                    <p className="text-red-400">{error}</p>
                </div>
            );
        }

        if (analysis) {
            return (
                <div className="p-6 sm:p-8">
                    <h3 className="text-2xl sm:text-3xl font-bold text-center text-yellow-300">
                        {analysis.headline}
                    </h3>
                    <div className="flex justify-around my-6 text-center">
                        <div>
                            <p className="text-sm text-gray-400">Budget</p>
                            <p className="text-xl font-semibold">${media.budget?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Box Office</p>
                            <p className="text-xl font-semibold">${media.revenue?.toLocaleString()}</p>
                        </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{analysis.report}</p>
                </div>
            );
        }

        return null;
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md fade-in"
            style={{ animationDuration: '300ms' }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-gray-800/50 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col fade-in-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 p-4 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-3">
                         <MoneyIcon className="w-6 h-6 text-green-400" />
                         <h1 className="font-bold text-lg text-white">Box Office Analysis</h1>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close analysis">
                        <CloseIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
                <div className="overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
