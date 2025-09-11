import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { MediaDetails } from '../types.ts';
import { getAiRecommendationsFromImage } from '../services/aiService.ts';
import { CloseIcon, CameraIcon, SparklesIcon, ArrowPathIcon } from './icons.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { RateLimitMessage } from './RateLimitMessage.tsx';
import { useSettings } from '../hooks/useSettings.ts';

interface VisionSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: MediaDetails) => void;
}

type VisionState = 'initial' | 'camera' | 'preview' | 'loading' | 'results' | 'error';

// Utility to convert a data URL to a Blob
const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Invalid data URL");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

export const VisionSearchModal: React.FC<VisionSearchModalProps> = ({ isOpen, onClose, onSelectMedia }) => {
    const [visionState, setVisionState] = useState<VisionState>('initial');
    const [results, setResults] = useState<MediaDetails[]>([]);
    const [resultsTitle, setResultsTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('Analyzing image...');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { aiClient, canMakeRequest, incrementRequestCount } = useSettings();

    const cleanup = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [stream]);

    useEffect(() => {
        if (!isOpen) {
            cleanup();
            setTimeout(() => {
                setVisionState('initial');
                setResults([]);
                setResultsTitle('');
                setPreviewImage(null);
            }, 300);
        }
    }, [isOpen, cleanup]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(mediaStream);
            setVisionState('camera');
        } catch (err) {
            setErrorMessage("Could not access camera. Please check permissions.");
            setVisionState('error');
        }
    };

    useEffect(() => {
        if (visionState === 'camera' && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [visionState, stream]);

    const handleCapture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if(context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setPreviewImage(dataUrl);
                setVisionState('preview');
                cleanup();
            }
        }
    };
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
                setVisionState('preview');
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSearch = async () => {
        if (!previewImage || !aiClient) return;
        const { canRequest } = canMakeRequest();
        if (!canRequest) return;

        setVisionState('loading');
        setErrorMessage('');
        
        try {
            const blob = dataURLtoBlob(previewImage);
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = (reader.result as string).split(',')[1];
                const imageData = {
                    data: base64data,
                    mimeType: blob.type
                };
                
                const { results: mediaResults, title } = await getAiRecommendationsFromImage(imageData, aiClient);
                incrementRequestCount();
                
                if (mediaResults.length === 0) {
                    setErrorMessage("Couldn't find any recommendations for that image. Try another one!");
                    setVisionState('error');
                } else {
                    setResults(mediaResults);
                    setResultsTitle(title);
                    setVisionState('results');
                }
            }
        } catch (error: any) {
            setErrorMessage(error.message || "An unexpected error occurred.");
            setVisionState('error');
        }
    };
    
    const handleSelectAndClose = (media: MediaDetails) => {
        onSelectMedia(media);
        onClose();
    };

    if (!isOpen) return null;

    const renderContent = () => {
        const { canRequest, resetTime } = canMakeRequest();
        if (!canRequest && resetTime) {
            return (
                <div className="p-6 flex items-center justify-center h-full">
                     <RateLimitMessage resetTime={resetTime} featureName="Scape Vision" />
                </div>
            )
        }
        
        switch (visionState) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <LoadingSpinner className="w-12 h-12" />
                        <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
                    </div>
                );
            case 'camera':
                 return (
                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black rounded-b-3xl">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                        <button onClick={handleCapture} className="absolute bottom-8 w-20 h-20 bg-white rounded-full border-4 border-black/30 shadow-lg" aria-label="Take Photo"></button>
                    </div>
                );
            case 'preview':
                return (
                    <div className="flex flex-col items-center justify-center h-full p-6">
                        <img src={previewImage!} alt="Preview" className="max-h-[60%] w-auto rounded-lg mb-6" />
                        <div className="flex gap-4">
                            <button onClick={() => setVisionState('initial')} className="px-4 py-2 text-sm bg-white/10 rounded-full">Back</button>
                            <button onClick={handleSearch} className="px-6 py-2 text-sm font-semibold bg-indigo-500/80 rounded-full">Search with this image</button>
                        </div>
                    </div>
                );
            case 'results':
            case 'error':
                 return (
                    <div className="flex flex-col h-full">
                        <div className="flex-shrink-0 p-6 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-200">{resultsTitle}</h2>
                             <button onClick={() => setVisionState('initial')} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                                 <ArrowPathIcon className="w-4 h-4"/>
                                 <span>Search Again</span>
                             </button>
                        </div>
                        <div className="flex-grow overflow-y-auto px-6 pb-6">
                             {visionState === 'error' ? (
                                <div className="text-center mt-12"> <p className="text-red-400">{errorMessage}</p> </div>
                            ) : (
                                <RecommendationGrid recommendations={results} onSelect={handleSelectAndClose} />
                            )}
                        </div>
                    </div>
                );
            case 'initial':
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <h2 className="text-2xl font-bold">Find media with an image</h2>
                        <p className="text-gray-400 mt-2 mb-8 max-w-sm">Use a poster, a screenshot, or a photo that captures a vibe.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={startCamera} className="glass-button primary">
                                <CameraIcon className="w-6 h-6"/>
                                <span>Use Camera</span>
                            </button>
                             <button onClick={() => fileInputRef.current?.click()} className="glass-button">
                                <span>Upload Image</span>
                             </button>
                             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                        </div>
                    </div>
                );
        }
    };

    return (
         <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 ai-search-modal-bg fade-in" 
            style={{ animationDuration: '300ms' }}
            onClick={onClose}
        >
            <div 
                className="w-full max-w-2xl h-[85vh] max-h-[700px] ai-search-modal-content rounded-3xl overflow-hidden flex flex-col fade-in-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <SparklesIcon className="w-6 h-6 text-indigo-400" />
                         <h1 className="font-bold text-lg">Scape Vision</h1>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close search">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};
