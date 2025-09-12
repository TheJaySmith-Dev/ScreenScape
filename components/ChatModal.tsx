import React, { useState, useEffect, useRef } from 'react';
import type { MediaDetails, ChatMessage, Brand } from '../types.ts';
import { CloseIcon, SendIcon } from './icons.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { startChatForMedia, startChatForBrand } from '../services/aiService.ts';
import { RateLimitMessage } from './RateLimitMessage.tsx';
import type { Chat } from '@google/genai';
import { useSettings } from '../hooks/useSettings.ts';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  media?: MediaDetails;
  brand?: Brand;
}

const formatMessageContent = (content: string): { __html: string } => {
    // Sanitize and format basic markdown.
    const formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\n/g, '<br />'); // Newlines
    return { __html: formattedContent };
};

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, media, brand }) => {
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const { aiClient, canMakeRequest, incrementRequestCount } = useSettings();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen || !aiClient) return;

        let session: Chat;
        let initialMessage: ChatMessage;

        if (brand) {
            session = startChatForBrand(brand, aiClient);
            initialMessage = { role: 'model', content: `Hi! I'm ScapeAI. I can answer any questions you have about the "${brand.name}" franchise. What would you like to know?` };
        } else if (media) {
            session = startChatForMedia(media, aiClient);
            initialMessage = { role: 'model', content: `Hi! I'm ScapeAI. I can answer any questions you have about "${media.title}" (${media.releaseYear}). What would you like to know?` };
        } else {
            return; // Don't open if no media or brand is provided
        }

        setChatSession(session);
        setMessages([initialMessage]);

    }, [isOpen, media, brand, aiClient]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chatSession || isLoading) return;

        const { canRequest } = canMakeRequest();
        if (!canRequest) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await chatSession.sendMessage({ message: userInput });
            incrementRequestCount();
            setMessages([...newMessages, { role: 'model', content: response.text }]);
        } catch (err: any) {
            const errorMessage = err.message || "Sorry, I couldn't get a response. Please try again.";
            setError(errorMessage);
            // Re-add the user's message to the new list, but not the failed model response
            setMessages(newMessages);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || (!media && !brand)) return null;
    
    const { canRequest, resetTime } = canMakeRequest();

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 chat-modal-bg fade-in" 
            style={{ animationDuration: '300ms' }}
            onClick={onClose}
        >
            <div 
                className="w-full max-w-lg h-[85vh] max-h-[600px] chat-modal-content rounded-3xl overflow-hidden flex flex-col fade-in-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 p-4 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-2">
                         <img src="https://img.icons8.com/?size=100&id=eoxMN35Z6JKg&format=png&color=FFFFFF" alt="ScapeAI logo" className="w-6 h-6" />
                         <h1 className="font-bold text-lg text-white">ScapeAI</h1>
                         <div className="flex items-center gap-1 text-xs text-gray-400">
                            <span>•</span>
                            <span>Powered by Gemini</span>
                            <img src="https://img.icons8.com/?size=100&id=rnK88i9FvAFO&format=png&color=FFFFFF" alt="Gemini logo" className="w-4 h-4" />
                         </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close chat">
                        <CloseIcon className="w-5 h-5 text-gray-300" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 chat-messages">
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`chat-bubble ${msg.role}`}
                            dangerouslySetInnerHTML={formatMessageContent(msg.content)} />
                    ))}
                    {isLoading && (
                        <div className="chat-bubble model">
                            <LoadingSpinner className="w-5 h-5" />
                        </div>
                    )}
                    {error && (
                        <div className="p-2 text-sm text-red-400 bg-red-500/10 rounded-lg">
                           {error}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="flex-shrink-0 p-4 border-t border-white/10">
                    { !canRequest && resetTime ? (
                        <RateLimitMessage resetTime={resetTime} featureName="AI Chat" />
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="relative w-full rounded-full chat-input-wrapper">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="w-full pl-4 pr-12 py-3 bg-transparent text-white rounded-full focus:outline-none"
                                    disabled={isLoading}
                                    autoFocus
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 disabled:opacity-50 transition-opacity" aria-label="Send message" disabled={isLoading || !userInput.trim()}>
                                    <SendIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};