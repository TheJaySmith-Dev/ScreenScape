import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon } from './icons.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';

// Add type declarations for the YouTube IFrame API to the global window object
declare global {
    interface Window {
      YT?: any;
      onYouTubeIframeAPIReady?: () => void;
    }
}

interface CustomVideoPlayerProps {
  videoId: string;
  onClose: () => void;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ videoId, onClose }) => {
  const [player, setPlayer] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    const createPlayer = () => {
        if (playerRef.current && window.YT) {
            const newPlayer = new window.YT.Player(playerRef.current, {
                videoId: videoId,
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  modestbranding: 1,
                  rel: 0,
                  iv_load_policy: 3,
                  showinfo: 0,
                  disablekb: 1,
                },
                events: {
                  onReady: onPlayerReady,
                  onStateChange: onPlayerStateChange,
                },
            });
            setPlayer(newPlayer);
        }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = createPlayer;
    } else {
      createPlayer();
    }

    return () => {
      // Clean up player and intervals on unmount
      player?.destroy();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      window.onYouTubeIframeAPIReady = undefined;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);


  const onPlayerReady = (event: any) => {
    setIsReady(true);
    setDuration(event.target.getDuration());
    setIsMuted(event.target.isMuted());
    event.target.playVideo();
  };

  const onPlayerStateChange = (event: any) => {
    if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
    }
    if (window.YT && event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      progressIntervalRef.current = window.setInterval(() => {
        const currentTime = event.target.getCurrentTime();
        const duration = event.target.getDuration();
        if (duration > 0) {
            setProgress((currentTime / duration) * 100);
        }
      }, 250);
    } else {
      setIsPlaying(false);
    }
    
    if (window.YT && event.data === window.YT.PlayerState.ENDED) {
      onClose();
    }
  };

  const togglePlay = () => {
    if (player) {
      isPlaying ? player.pauseVideo() : player.playVideo();
    }
  };

  const toggleMute = () => {
    if (player) {
      if (player.isMuted()) {
        player.unMute();
        setIsMuted(false);
      } else {
        player.mute();
        setIsMuted(true);
      }
    }
  };
  
  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!player || !progressContainerRef.current) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    player.seekTo(newTime, true);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 fade-in"
      onClick={onClose}
    >
      <div
        ref={playerContainerRef}
        className="player-glass-container w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="youtube-player" ref={playerRef} className="w-full h-full"></div>
        
        {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                <LoadingSpinner />
            </div>
        )}

        <div className="player-controls">
            <div className="player-btn" onClick={togglePlay}>
                {isPlaying ? '⏸️' : '▶️'}
            </div>
            <div className="player-progress-container" ref={progressContainerRef} onClick={handleSeekClick}>
                <div className="player-progress" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="player-btn" onClick={toggleMute}>
                {isMuted ? '🔇' : '🔊'}
            </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 glass-button !rounded-full opacity-80 hover:opacity-100"
          aria-label="Close player"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};