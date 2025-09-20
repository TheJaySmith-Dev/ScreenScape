import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CloseIcon, PlaySolidIcon, PauseIcon, VolumeUpIcon, VolumeOffIcon, FullScreenEnterIcon, FullScreenExitIcon } from './icons.tsx';
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
  videoTitle: string;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ videoId, onClose, videoTitle }) => {
  const playerInstanceRef = useRef<any | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(100);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const hideControls = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
        if (playerInstanceRef.current && playerInstanceRef.current.getPlayerState() === 1) { // 1 = PLAYING
             setIsControlsVisible(false);
        }
    }, 3000);
  }, []);

  const showControls = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setIsControlsVisible(true);
    hideControls();
  }, [hideControls]);

  // Load YouTube IFrame API and create player
  useEffect(() => {
    // This handler is called when the YouTube player is ready.
    const onPlayerReady = (event: any) => {
        const player = event.target;
        setIsReady(true);
        setDuration(player.getDuration());
        setVolume(player.getVolume());
        setIsMuted(player.isMuted());
        // Autoplay is handled by playerVars, we just need to manage the controls UI.
        hideControls();
    };

    // This handler is called when the player's state changes (e.g., playing, paused).
    const onPlayerStateChange = (event: any) => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        
        const player = playerInstanceRef.current;
        if (!player) return;

        const playerState = event.data;
        
        // When the video is playing, start an interval to update the progress bar.
        if (playerState === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            hideControls();
            progressIntervalRef.current = window.setInterval(() => {
                const currentTime = player.getCurrentTime() || 0;
                // Always get the latest duration inside the interval to prevent issues
                // where getDuration() returns 0 on the first few checks.
                const currentDuration = player.getDuration() || 0;
                if (currentDuration > 0) {
                    setProgress((currentTime / currentDuration) * 100);
                    // Also update the duration state if it was initially 0
                    if (duration === 0) {
                        setDuration(currentDuration);
                    }
                }
            }, 250);
        } else {
            // If the video is paused, stopped, or buffered, clear the interval.
            setIsPlaying(false);
            showControls();
        }
        
        // When the video ends, close the player modal.
        if (playerState === window.YT.PlayerState.ENDED) {
            onClose();
        }
    };
    
    // Creates the YouTube player instance.
    const createPlayer = () => {
        if (playerRef.current && window.YT) {
            const newPlayer = new window.YT.Player(playerRef.current, {
                videoId: videoId,
                playerVars: {
                  autoplay: 1,        // Autoplay the video on load
                  controls: 0,        // Hide native YouTube controls
                  mute: 1,            // Mute is required for autoplay in most browsers
                  rel: 0,             // Don't show related videos
                  showinfo: 0,        // Hide video title (deprecated but good to have)
                  modestbranding: 1,  // Less prominent YouTube logo
                  iv_load_policy: 3,  // Disable annotations
                  disablekb: 1,       // Disable keyboard controls
                  playsinline: 1,     // Play inline on iOS
                },
                events: {
                  onReady: onPlayerReady,
                  onStateChange: onPlayerStateChange,
                },
            });
            playerInstanceRef.current = newPlayer;
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
      playerInstanceRef.current?.destroy();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, [videoId, hideControls, showControls, onClose, duration]);
  
  const togglePlay = () => {
    const player = playerInstanceRef.current;
    if (player) {
        isPlaying ? player.pauseVideo() : player.playVideo();
    }
  };
  
  const toggleMute = () => {
    const player = playerInstanceRef.current;
    if (!player) return;
    if (player.isMuted()) {
      player.unMute(); 
      setIsMuted(false);
    } else {
      player.mute(); 
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const player = playerInstanceRef.current;
    if (!player) return;
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    player.setVolume(newVolume);
    if (newVolume > 0 && player.isMuted()) {
      player.unMute();
      setIsMuted(false);
    }
  };
  
  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const player = playerInstanceRef.current;
    const progressContainer = progressContainerRef.current;
    if (!player || !progressContainer) return;
    
    const currentDuration = player.getDuration();
    if (currentDuration <= 0) return; // Can't seek if duration is unknown

    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * currentDuration;
    player.seekTo(newTime, true);
  };

  const toggleFullScreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen().catch(err => console.error(err));
    } else {
        document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 fade-in"
      onClick={onClose}
    >
      <div
        ref={playerContainerRef}
        className="player-container w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={showControls}
        onMouseLeave={() => isPlaying && setIsControlsVisible(false)}
      >
        <div id="youtube-player" ref={playerRef} className="w-full h-full"></div>
        
        {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                <LoadingSpinner />
            </div>
        )}

        <div className={`video-title-overlay ${isControlsVisible ? 'visible' : ''}`}>{videoTitle}</div>

        <div className={`player-overlay-gradient ${isControlsVisible ? '' : 'opacity-0'}`} />

        <div className={`player-controls ${isControlsVisible ? 'visible' : ''}`}>
          <div className="player-progress-container" ref={progressContainerRef} onClick={handleSeekClick}>
              <div className="player-progress" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="player-bottom-controls">
            <button className="player-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlaySolidIcon className="w-7 h-7" />}
            </button>
            <div className="volume-container">
              <button className="player-btn" onClick={toggleMute} aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}>
                {isMuted || volume === 0 ? <VolumeOffIcon className="w-6 h-6" /> : <VolumeUpIcon className="w-6 h-6" />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                aria-label="Volume control"
              />
            </div>
            <div className="flex-grow"></div>
            <button className="player-btn" onClick={toggleFullScreen} aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
              {isFullScreen ? <FullScreenExitIcon className="w-6 h-6" /> : <FullScreenEnterIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 glass-button !rounded-full transition-opacity"
          aria-label="Close player"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};