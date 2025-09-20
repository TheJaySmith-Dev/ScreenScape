import React, { useState, useEffect } from 'react';
import type { MediaDetails } from '../types.ts';
import { CloseIcon, BellIcon, CheckCircleIcon } from './icons.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaDetails;
}

type SubscriptionState = 'idle' | 'loading' | 'success' | 'error';

// This is the Resend API key provided by the user.
const RESEND_API_KEY = 're_L2L4NwEd_NysxgEaMqG6FtNK4XqTJTCfC';
const FROM_EMAIL = 'ScreenScape Reminders <onboarding@resend.dev>';

export const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, media }) => {
    const [email, setEmail] = useState('');
    const [state, setState] = useState<SubscriptionState>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal is closed
            setTimeout(() => {
                setEmail('');
                setState('idle');
                setErrorMessage('');
                setIsSubmitting(false);
            }, 300);
        }
    }, [isOpen]);

    const validateEmail = (email: string): boolean => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }
        
        setIsSubmitting(true);
        setState('loading');
        setErrorMessage('');

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: FROM_EMAIL,
                    to: email,
                    subject: `Reminder Set for ${media.title}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                            <h2 style="color: #0074E8;">You're all set!</h2>
                            <p>This email confirms you want reminders for new episodes of <strong>${media.title}</strong>.</p>
                            <p style="font-size: 0.8em; color: #777;">Note: This is a demo feature. Automated notifications for new episodes are not yet active.</p>
                            <p>Happy watching!</p>
                            <p style="font-size: 0.8em; color: #777;">- The ScreenScape Team</p>
                        </div>
                    `,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send confirmation email.');
            }
            
            setState('success');
            setTimeout(() => onClose(), 3000); // Close modal after 3 seconds on success

        } catch (error: any) {
            console.error('Subscription error:', error);
            setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
            setState('error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderContent = () => {
        switch(state) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center h-48">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-300">Sending confirmation...</p>
                    </div>
                );
            case 'success':
                 return (
                    <div className="flex flex-col items-center justify-center text-center h-48 fade-in">
                        <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
                        <h3 className="text-2xl font-bold text-white">Confirmation Sent!</h3>
                        <p className="text-gray-300 mt-2">A confirmation email has been sent to {email}.</p>
                    </div>
                );
            case 'error':
            case 'idle':
                return (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <BellIcon className="w-6 h-6 text-yellow-400" />
                            <h2 className="text-2xl font-bold text-white">Get New Episode Reminders</h2>
                        </div>
                        <p className="text-gray-300 mb-6">
                            Enter your email to get a notification whenever a new episode of <strong>{media.title}</strong> is released.
                        </p>
                        <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/80 focus:outline-none transition-colors placeholder-gray-400"
                                aria-label="Email Address"
                                autoFocus
                                disabled={isSubmitting}
                            />
                            {errorMessage && <p className="text-red-400 text-sm -mt-2">{errorMessage}</p>}
                            <button
                                type="submit"
                                className="w-full mt-2 px-4 py-3 text-white bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/50 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                Confirm Email
                            </button>
                        </form>
                    </>
                );
        }
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[70] p-4 fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md glass-panel rounded-3xl p-8 fade-in-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full glass-button text-gray-300 hover:text-white transition-colors z-10"
                    aria-label="Close"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>
                {renderContent()}
            </div>
        </div>
    );
};