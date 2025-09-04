import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    PlaySolidIcon, 
    PauseIcon, 
    VolumeUpIcon, 
    VolumeOffIcon, 
    FullScreenEnterIcon, 
    FullScreenExitIcon, 
    CloseIcon 
} from './icons.tsx';
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

// Function to format time from seconds to mm:ss
const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ videoId, onClose }) => {
  const [player, setPlayer] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    } else {
      createPlayer();
    }

    return () => {
      // Clean up player and intervals on unmount
      if (player) {
        player.destroy();
      }
      if ((window as any).progressInterval) {
        clearInterval((window as any).progressInterval);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);


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

  const onPlayerReady = (event: any) => {
    setIsReady(true);
    setDuration(event.target.getDuration());
    setVolume(event.target.getVolume() / 100);
    setIsMuted(event.target.isMuted());
    event.target.playVideo();
  };

  const onPlayerStateChange = (event: any) => {
    if (window.YT && event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      const interval = setInterval(() => {
        if (event.target.getCurrentTime) {
            setCurrentTime(event.target.getCurrentTime());
            setProgress((event.target.getCurrentTime() / event.target.getDuration()) * 100);
        }
      }, 250);
      (window as any).progressInterval = interval;
    } else {
      setIsPlaying(false);
      if ((window as any).progressInterval) {
        clearInterval((window as any).progressInterval);
      }
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = (Number(e.target.value) / 100) * duration;
    player?.seekTo(seekTime, true);
    setProgress(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    player?.setVolume(newVolume * 100);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      player?.unMute();
    }
  };

  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
        setVolume(player.getVolume() / 100);
      } else {
        player.mute();
        setVolume(0);
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = useCallback(() => {
    const elem = playerContainerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);


  const hideControls = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if(isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    hideControls();
  };
  
  useEffect(() => {
    if (isPlaying) {
        hideControls();
    } else {
        setShowControls(true);
        if(controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    }
    return () => {
        if(controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const progressStyle = {
    background: `linear-gradient(to right, #ffffff ${progress}%, rgba(255, 255, 255, 0.2) ${progress}%)`,
  };

  const volumeStyle = {
    background: `linear-gradient(to top, #ffffff ${volume * 100}%, rgba(255, 255, 255, 0.2) ${volume * 100}%)`,
  };


  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 fade-in"
      onClick={onClose}
    >
      <div
        ref={playerContainerRef}
        className="relative w-full max-w-4xl aspect-video bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl overflow-hidden group/player"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <div id="youtube-player" ref={playerRef} className="w-full h-full"></div>
        
        {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                <LoadingSpinner />
            </div>
        )}

        {/* Controls Overlay */}
        <div
          className={`absolute inset-0 flex flex-col justify-between p-4 transition-opacity duration-300 text-white ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%, transparent 60%, rgba(0,0,0,0.4))' }}
        >
          {/* Top Controls */}
           <div className="flex justify-end">
             <button
              onClick={onClose}
              className="p-2 bg-black/30 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors"
              aria-label="Close player"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
           </div>
          
           {/* Center Play/Pause button */}
           <div 
             className="absolute inset-0 flex items-center justify-center"
             onClick={togglePlay}
           >
             <button
               className={`p-4 bg-black/30 rounded-full backdrop-blur-sm hover:bg-white/20 scale-125 transition-all duration-300 ${
                isPlaying ? 'opacity-0 group-hover/player:opacity-100' : 'opacity-100'
               }`}
               aria-label={isPlaying ? 'Pause' : 'Play'}
             >
               {isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlaySolidIcon className="w-8 h-8"/>}
             </button>
           </div>

          {/* Bottom Controls */}
          <div className="w-full">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="video-slider"
                style={progressStyle}
              />
              <span className="text-xs font-mono">{formatTime(duration)}</span>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-4">
                 <button onClick={togglePlay} className="p-2" aria-label={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? <PauseIcon className="w-6 h-6"/> : <PlaySolidIcon className="w-6 h-6"/>}
                </button>
                <div className="group/volume relative flex items-center">
                   <button onClick={toggleMute} className="p-2" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                     {volume > 0 && !isMuted ? <VolumeUpIcon className="w-6 h-6"/> : <VolumeOffIcon className="w-6 h-6"/>}
                   </button>
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-black/40 backdrop-blur-md rounded-lg opacity-0 group-hover/volume:opacity-100 transition-opacity pointer-events-none group-hover/volume:pointer-events-auto">
                     <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="volume-slider"
                      style={volumeStyle}
                     />
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={toggleFullscreen} className="p-2" aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                    {isFullscreen ? <FullScreenExitIcon className="w-6 h-6"/> : <FullScreenEnterIcon className="w-6 h-6"/>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};