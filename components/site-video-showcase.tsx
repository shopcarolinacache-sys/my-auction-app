'use client'

import React, { useRef, useEffect, useState } from 'react';

interface NavigatorWithConnection extends Navigator {
  connection?: {
    saveData?: boolean;
  };
}

const hasSaveDataEnabled = (): boolean => {
  if (typeof navigator !== 'undefined') {
    const nav = navigator as NavigatorWithConnection;
    return nav.connection?.saveData === true;
  }
  return false;
};

export function SiteVideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = hasSaveDataEnabled();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || prefersReducedMotion || saveData) {
            // Pause, reset, and show play button when scrolled away or if user prefers reduced motion/save data
            if (!video.paused) {
              video.pause();
            }
            video.currentTime = 0;
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handlePlayButtonClick = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0; // Reset to beginning
      video.muted = true; // Ensure muted for playsInline
      video.playsInline = true; // Ensure playsInline
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.error('Video playback failed:', e));
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0; // Reset to beginning after ending
    }
  };

  return (
    <section data-site-video aria-labelledby="site-video-heading" className="border-t border-neutral-200 bg-neutral-950 px-5 py-16 text-white sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.7fr_1fr] md:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Featured film</p>
          <h2 data-video-title id="site-video-heading" className="mt-3 text-3xl font-black tracking-tight">The archive, in motion</h2>
          <p data-video-caption className="mt-3 max-w-md text-sm leading-relaxed text-neutral-300">A closer look at the pieces behind the collection.</p>
        </div>
        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            onEnded={handleVideoEnd}
            muted
            loop
            playsInline
            preload="metadata"
            poster="https://cjlraclxbmhbnsgvtjar.supabase.co/storage/v1/object/public/Site%20media/CCPOSTER.jpg"
            className="size-full object-cover"
          >
            <source src="https://cjlraclxbmhbnsgvtjar.supabase.co/storage/v1/object/public/Site%20media/Carolinachacevideo.mp4" type="video/mp4" />
          </video>
          {!isPlaying && (
            <button
              onClick={handlePlayButtonClick}
              className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Play video"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-16 text-white">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.38 2.792-1.614L18.82 12c1.262.776 1.262 2.644 0 3.42l-11.528 7.961c-1.263.766-2.792-.188-2.792-1.614V5.653Z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
