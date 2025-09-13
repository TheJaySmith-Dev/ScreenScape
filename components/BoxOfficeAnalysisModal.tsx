import React, { useState, useEffect, useCallback } from 'react';
import type { MediaDetails } from '../types.ts';
import { getAiBoxOfficeAnalysis } from '../services/aiService.ts';
import { useSettings } from '../hooks/useSettings.ts';
import { CloseIcon, MoneyIcon } from './icons.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { RateLimitMessage } from './RateLimitMessage.tsx';

interface BoxOfficeAnalysisModalProps {
    media: MediaDetails;
    isOpen: boolean;
    onClose: () => void;
}

type AnalysisState = 'loading' | 'results' | 'error';

export const BoxOfficeAnalysisModal: React.FC<BoxOfficeAnalysisModalProps> = ({ media, isOpen, onClose }) => {
    const [analysisState, setAnalysisState] = useState<AnalysisState>('loading');
    const [analysis, setAnalysis] = useState<{ headline: string; report: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const { aiClient, canMakeRequest, incrementRequestCount } = useSettings();

    const fetchAnalysis = useCallback(async () => {
        if (!aiClient || !media.budget || !media.revenue) {
            setErrorMessage("Missing data to perform analysis.");
            setAnalysisState('error');
            return;
        }

        const { canRequest } = canMakeRequest();
        if (!canRequest) {
            // The RateLimitMessage will be shown by the renderContent function
            setAnalysisState('error');
            return;
        }

        setAnalysisState('loading');
        try {
            incrementRequestCount();
            const result = await getAiBoxOfficeAnalysis(media.title, media.budget, media.revenue, aiClient);
            setAnalysis(result);
            setAnalysisState('results');
        } catch (error: any) {
            console.error("Box office analysis failed:", error);
            setErrorMessage(error.message || "An unexpected error occurred.");
            setAnalysisState('error');
        }
    }, [aiClient, media, canMakeRequest, incrementRequestCount]);

    useEffect(() => {
        if (isOpen) {
            fetchAnalysis();
        }
    }, [isOpen, fetchAnalysis]);

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
        const { canRequest, resetTime } = canMakeRequest();
        if (!canRequest && resetTime) {
            return (
                <div className="p-6 flex items-center justify-center h-full">
                     <RateLimitMessage resetTime={resetTime} featureName="Box Office Analysis" />
                </div>
            )
        }

        switch (analysisState) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center text-center h-64">
                        <LoadingSpinner className="w-12 h-12" />
                        <p className="mt-4 text-lg text-gray-300">Analyzing the numbers...</p>
                    </div>
                );
            case 'error':
                return (
                    <div className="text-center p-8">
                        <p className="text-red-400">{errorMessage}</p>
                    </div>
                );
            case 'results':
                if (!analysis) return null;
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
