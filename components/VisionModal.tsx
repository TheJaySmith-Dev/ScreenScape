import React, { useState, useRef, useEffect } from 'react';
import type { VisionMessage, MediaDetails, UserLocation } from '../types';
import { CloseIcon, VisionIcon } from './icons';
import { chatWithVision } from '../services/geminiService';
import { fetchDetailsByTitle } from '../services/tmdbService';
import { MediaRow } from './MediaRow';

interface VisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocation | null;
  onSelectMedia: (media: MediaDetails) => void;
}

const parseMarkdownLinks = (text: string): (string | JSX.Element)[] => {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;
  
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const [, linkText, url] = match;
      parts.push(
        <a
          href={url}
          key={url + match.index}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {linkText}
        </a>
      );
      lastIndex = regex.lastIndex;
    }
  
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
  
    return parts;
};

const AiMessage: React.FC<{ message: VisionMessage; onSelectMedia: (media: MediaDetails) => void; }> = ({ message, onSelectMedia }) => {
    return (
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/50 flex items-center justify-center border border-blue-400">
                <VisionIcon className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-800/60 rounded-xl rounded-tl-none p-4 max-w-full">
                {message.isLoading ? (
                    <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                    </div>
                ) : (
                    <>
                        {message.text && (
                            <div className="text-gray-200 space-y-2">
                               {message.text.split('\n').map((line, index) => (
                                    <p key={index}>{parseMarkdownLinks(line)}</p>
                                ))}
                            </div>
                        )}
                        {message.recommendations && message.recommendations.length > 0 && (
                            <div className="mt-4 -mb-4 w-[calc(100%+2rem)]">
                                <MediaRow 
                                    title="" 
                                    items={message.recommendations} 
                                    onSelect={onSelectMedia}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const UserMessage: React.FC<{ message: VisionMessage }> = ({ message }) => {
    return (
        <div className="flex justify-end">
            <div className="bg-white/10 rounded-xl rounded-tr-none p-4 max-w-lg">
                <p className="text-white">{message.text}</p>
            </div>
        </div>
    );
};


export const VisionModal: React.FC<VisionModalProps> = ({ isOpen, onClose, userLocation, onSelectMedia }) => {
    const [messages, setMessages] = useState<VisionMessage[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { id: 'initial', sender: 'ai', text: "Hello! I'm WatchNow Vision. How can I help you find something to watch today?\n\nYou can ask for recommendations by genre or actor, or even ask where to book tickets for a movie." }
            ]);
        }
    }, [isOpen, messages.length]);

    useEffect(scrollToBottom, [messages]);
    
    if (!isOpen) return null;

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMessage: VisionMessage = { id: Date.now().toString(), sender: 'user', text: input.trim() };
        const loadingMessage: VisionMessage = { id: (Date.now() + 1).toString(), sender: 'ai', isLoading: true };

        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setInput('');
        setIsThinking(true);

        try {
            const visionResponse = await chatWithVision(userMessage.text!, userLocation);

            let finalAiMessage: VisionMessage = {
                id: loadingMessage.id,
                sender: 'ai',
                text: visionResponse.responseText,
            };

            if (visionResponse.recommendations && visionResponse.recommendations.length > 0) {
                const tmdbPromises = visionResponse.recommendations.map(rec => 
                    fetchDetailsByTitle(rec.title, rec.type)
                );
                const tmdbResults = await Promise.all(tmdbPromises);
                const validResults = tmdbResults.filter((result): result is MediaDetails => result !== null);
                finalAiMessage.recommendations = validResults;
            }

            setMessages(prev => prev.map(msg => msg.id === loadingMessage.id ? finalAiMessage : msg));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Sorry, something went wrong.";
            const errorAiMessage: VisionMessage = { id: loadingMessage.id, sender: 'ai', text: errorMessage };
            setMessages(prev => prev.map(msg => msg.id === loadingMessage.id ? errorAiMessage : msg));
        } finally {
            setIsThinking(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 fade-in" onClick={onClose}>
            <div className="relative w-full max-w-2xl h-[85vh] bg-gray-900/60 border border-white/20 rounded-2xl overflow-hidden flex flex-col backdrop-blur-xl" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <VisionIcon className="w-6 h-6 text-blue-400" />
                        <h2 className="text-xl font-bold">WatchNow Vision</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </header>
                
                <div className="flex-grow p-4 overflow-y-auto space-y-6">
                    {messages.map(msg => 
                        msg.sender === 'user' ? 
                        <UserMessage key={msg.id} message={msg} /> :
                        <AiMessage key={msg.id} message={msg} onSelectMedia={onSelectMedia} />
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/10 flex-shrink-0">
                    <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask about movies, genres, actors..."
                            disabled={isThinking}
                            className="w-full pl-4 pr-12 py-3 text-base text-white bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors placeholder-gray-500"
                        />
                         <button type="submit" disabled={isThinking} className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-white disabled:opacity-50">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                               <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};