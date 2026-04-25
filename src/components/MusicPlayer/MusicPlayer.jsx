// Remove VITE_YT_API_KEY from .env before pushing to GitHub
import React, { useState, useEffect, useRef } from 'react';
import './MusicPlayer.css';

const API_KEY = import.meta.env.VITE_YT_API_KEY;

const SEARCH_QUERIES = {
  IN: [
    "hindi lofi beats study",
    "bollywood chill lo-fi",
    "indian lofi hip hop",
    "hindi aesthetic music",
    "lo-fi hindi songs chill",
  ],
  US: ["lofi hip hop chill beats", "ambient study music"],
  GB: ["lofi hip hop chill beats", "uk ambient electronic"],
  AU: ["lofi chill study beats", "ambient instrumental"],
  CA: ["lofi hip hop relax", "canadian indie ambient"],
  DEFAULT: [
    "lofi hip hop beats study",
    "cinematic ambient music",
    "chill instrumental beats",
    "aesthetic lo-fi music",
  ],
};

const getQueryForCountry = (countryCode) => {
  const queries = SEARCH_QUERIES[countryCode] || SEARCH_QUERIES.DEFAULT;
  return queries[Math.floor(Math.random() * queries.length)];
};

const MusicPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [country, setCountry] = useState(null);
  const [videoList, setVideoList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const apiLoadedRef = useRef(false);

  // 1. Geo Detection & Preload
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const code = data.country_code || 'DEFAULT';
        setCountry(code);
        preloadTracks(code);
      })
      .catch(() => {
        setCountry('DEFAULT');
        preloadTracks('DEFAULT');
      });

    return () => clearInterval(progressIntervalRef.current);
  }, []);

  const preloadTracks = async (code) => {
    if (!API_KEY) return;
    setIsLoading(true);
    const query = getQueryForCountry(code);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&videoEmbeddable=true&maxResults=15&q=${encodeURIComponent(query)}&key=${API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.items) {
        const tracks = data.items.map(item => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.default.url,
        })).sort(() => Math.random() - 0.5);
        setVideoList(tracks);
      }
    } catch (err) {
      console.error('YouTube search failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. YouTube IFrame API Setup
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    }
  }, []);

  const initPlayer = () => {
    if (apiLoadedRef.current) return;
    apiLoadedRef.current = true;
    playerRef.current = new window.YT.Player('yt-player-hidden', {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            handleNext();
          }
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startProgressTracker();
          } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.BUFFERING) {
            // keep isPlaying true if buffering to keep UI active
          } else {
            setIsPlaying(false);
            clearInterval(progressIntervalRef.current);
          }
        },
        onError: (event) => {
          // Skip if video restricted or error
          if ([5, 101, 150].includes(event.data)) {
            handleNext();
          }
        }
      }
    });
  };

  const startProgressTracker = () => {
    clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getDuration) {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) {
          setProgress((currentTime / duration) * 100);
        }
      }
    }, 500);
  };

  // 3. Player Controls
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (videoList.length === 0) return;
    const nextIdx = (currentIndex + 1) % videoList.length;
    setCurrentIndex(nextIdx);
    playerRef.current.loadVideoById(videoList[nextIdx].videoId);
    playerRef.current.playVideo();
  };

  const handleShuffle = async () => {
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 500);

    // 70% chance to pick from loaded, 30% to refetch
    if (Math.random() > 0.3 || videoList.length < 3) {
      const nextIdx = Math.floor(Math.random() * videoList.length);
      setCurrentIndex(nextIdx);
      playerRef.current.loadVideoById(videoList[nextIdx].videoId);
      playerRef.current.playVideo();
    } else {
      await preloadTracks(country);
      setCurrentIndex(0);
      if (videoList.length > 0) {
        playerRef.current.loadVideoById(videoList[0].videoId);
        playerRef.current.playVideo();
      }
    }
    setProgress(0);
  };

  const handleToggleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      // Auto-start if not playing and we have tracks
      if (!isPlaying && videoList.length > 0) {
        const track = videoList[currentIndex];
        playerRef.current.loadVideoById(track.videoId);
        playerRef.current.playVideo();
      }
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  // 4. Click Outside Logic
  const containerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  const currentTrack = videoList[currentIndex];

  return (
    <div className="player-wrapper" ref={containerRef}>
      <div 
        className={`capsule ${isExpanded ? 'expanded' : ''} ${!isPlaying ? 'paused' : ''}`}
        onClick={handleToggleExpand}
      >
        <div className="cassette-toggle">
          {isPlaying ? (
            <div className={`mini-reels playing-reels`}>
              <div className={`mini-reel reel-spinning`}>
                <div className="mini-reel-inner"></div>
              </div>
              <div className={`mini-reel reel-spinning`}>
                <div className="mini-reel-inner"></div>
              </div>
            </div>
          ) : (
            <div className="cassette-idle-dots">
              <div className="dot top-left"></div>
              <div className="dot center-1"></div>
              <div className="dot center-2"></div>
            </div>
          )}
          <div className={`notification-dot ${isPlaying ? 'visible' : ''}`}></div>
        </div>

        {/* Track Info (Only visible when expanded) */}
        {isExpanded && (
          <>
            <div className="track-info">
              {isLoading ? (
                <div className="loading-indicator">
                  <div className="loading-dot"></div>
                  <span>Scanning frequencies...</span>
                </div>
              ) : currentTrack ? (
                <>
                  <span className="track-title">{currentTrack.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'")}</span>
                  <span className="track-artist">{currentTrack.channelTitle}</span>
                  <div className="track-geo">
                    {country === 'IN' ? '🇮🇳 india' : '🌍 global'} lo-fi
                  </div>
                </>
              ) : (
                <span className="track-artist">No signal found.</span>
              )}
            </div>

            {/* Waveform */}
            <div className="waveform">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`wave-bar ${isPlaying ? 'playing' : ''}`}></div>
              ))}
            </div>

            {/* Controls */}
            <div className="player-controls">
              <button className="control-btn" onClick={togglePlay}>
                {isPlaying ? (
                  <div className="pause-icon">
                    <div className="pause-bar"></div>
                    <div className="pause-bar"></div>
                  </div>
                ) : (
                  <div className="play-icon"></div>
                )}
              </button>
              <button className={`control-btn shuffle-btn ${isShuffling ? 'spinning' : ''}`} onClick={handleShuffle}>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              </button>
              <div className="close-btn" onClick={handleClose}>×</div>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </>
        )}
      </div>

      {/* Hidden YouTube Engine */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
        <div id="yt-player-hidden"></div>
      </div>
    </div>
  );
};

export default MusicPlayer;
