"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import MoreInfo from "@/components/MoreInfo";
import HomePage from "@/components/HomePage";
import ProjectsSection from "@/components/ProjectsSection";
import "./globals.css";
import "./fireflies.css";

export default function Home() {
  const [isSplashLoaded, setIsSplashLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgSrc, setBgSrc] = useState("");
  const [blurAmount, setBlurAmount] = useState(0);

  // State for hard-scroll projects lock
  const [isProjectsLocked, setIsProjectsLocked] = useState(false);
  const [overscrollProgress, setOverscrollProgress] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const accumulatorRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const handleNextClick = () => {
    setIsLoaded(true);
    // Wait for MoreInfo to render, then scroll to it
    setTimeout(() => {
      const el = document.getElementById("more-info");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  useEffect(() => {
    const smolImg = "https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/assets/images/plsloadgoddamnitsmol.webp";
    const fullImg = "https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/assets/images/plsloadgoddamnit.png";

    const img = new Image();
    img.src = smolImg;
    img.onload = () => {
      setBgSrc(smolImg);

      const highResImg = new Image();
      highResImg.src = fullImg;
      highResImg.onload = () => {
        setBgSrc(fullImg);
      };
    };
  }, []);

  // Scroll listener for blur effect
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const scrollY = scrollContainerRef.current.scrollTop;
      const viewportHeight = window.innerHeight;
      const newBlur = Math.min(scrollY / (viewportHeight * 0.1), 10);
      setBlurAmount(newBlur);
    };

    const scroller = scrollContainerRef.current;
    if (scroller) {
      scroller.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      if (scroller) {
        scroller.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Hard-Scroll (Overscroll) detector at the end of the site
  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller || isProjectsLocked) return;

    const checkAndAccumulate = (delta: number) => {
      if (!scroller) return;
      const isAtBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 12;

      if (isAtBottom && delta > 0) {
        // Balanced scroll resistance: intentional and satisfying without feeling grueling
        const increment = Math.min(65, Math.max(6, delta * 0.35));
        accumulatorRef.current = Math.min(650, accumulatorRef.current + increment);
        const progress = Math.min(100, (accumulatorRef.current / 600) * 100);
        setOverscrollProgress(progress);

        if (progress >= 100) {
          setIsProjectsLocked(true);
        }
      } else if (!isAtBottom || delta < 0) {
        if (accumulatorRef.current > 0) {
          accumulatorRef.current = Math.max(0, accumulatorRef.current - 15);
          setOverscrollProgress(Math.min(100, (accumulatorRef.current / 250) * 100));
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      checkAndAccumulate(e.deltaY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = touchStartYRef.current - e.touches[0].clientY;
      if (deltaY > 0) {
        checkAndAccumulate(deltaY * 1.5);
      }
    };

    scroller.addEventListener("wheel", handleWheel, { passive: true });
    scroller.addEventListener("touchstart", handleTouchStart, { passive: true });
    scroller.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Decay overscroll indicator when user stops pulling
    const decayInterval = setInterval(() => {
      if (accumulatorRef.current > 0 && accumulatorRef.current < 250) {
        accumulatorRef.current = Math.max(0, accumulatorRef.current - 8);
        setOverscrollProgress(Math.min(100, (accumulatorRef.current / 250) * 100));
      }
    }, 100);

    return () => {
      scroller.removeEventListener("wheel", handleWheel);
      scroller.removeEventListener("touchstart", handleTouchStart);
      scroller.removeEventListener("touchmove", handleTouchMove);
      clearInterval(decayInterval);
    };
  }, [isProjectsLocked, isLoaded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashLoaded(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isProjectsLocked) {
    return (
      <>
        <ProjectsSection />
        <Script src="https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/oneko/oneko.js" strategy="afterInteractive" data-cat="https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/oneko/oneko.gif" />
      </>
    );
  }

  return (
    <>
      <div
        id="bg-container"
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{
          zIndex: -1,
          filter: `blur(${blurAmount}px)`,
          transform: `scale(${1 + blurAmount * 0.015})`,
          transition: "filter 0.3s ease-out, transform 0.3s ease-out"
        }}
      >
        <div
          id="bg-layer"
          className="w-full h-full bg-cover bg-center bg-no-repeat animate-fadeIn"
          style={{
            backgroundImage: bgSrc ? `url("${bgSrc}")` : "none",
            backgroundColor: "#2b3a4f",
          }}
        />
        {/* Fireflies (Part of the background scene) */}
        <div className="firefly"></div>
        <div className="firefly"></div>
        <div className="firefly"></div>
        <div className="firefly"></div>
        <div className="firefly"></div>
        <div className="firefly"></div>
        <div className="firefly"></div>
      </div>

      <div
        ref={scrollContainerRef}
        className="relative z-10 w-full h-screen overflow-y-auto snap-y snap-mandatory no-scrollbar animate-fadeIn"
      >
        {isSplashLoaded ? (
          <>
            <HomePage onUnlockScroll={handleNextClick} />
          </>
        ) : null}
        {isLoaded ? (
          <>
            <MoreInfo />
          </>
        ) : null}

        {/* Growing Wormhole Dimensional Portal Animation from Bottom */}
        {overscrollProgress > 0 && (
          <div
            className="fixed bottom-0 left-1/2 z-30 pointer-events-none transition-transform duration-75 origin-bottom flex items-center justify-center"
            style={{
              transform: `translateX(-50%) translateY(${Math.max(6, 56 - overscrollProgress * 0.5)}%) scale(${0.2 + (overscrollProgress / 100) * 2.5})`,
              opacity: Math.min(1, overscrollProgress / 10),
              filter: `drop-shadow(0 0 ${overscrollProgress * 0.9}px rgba(236, 147, 63, ${0.4 + overscrollProgress * 0.006}))`,
            }}
          >
            <div className="relative w-80 h-80 md:w-[460px] md:h-[460px]">
              {/* Outer rotating cosmic ring */}
              <div
                className="wormhole-ring-outer"
                style={{ animationDuration: `${Math.max(1.0, 4.0 - (overscrollProgress / 100) * 3.0)}s` }}
              />

              {/* Inner contra-rotating cosmic swirl */}
              <div
                className="wormhole-ring-inner"
                style={{ animationDuration: `${Math.max(0.6, 2.5 - (overscrollProgress / 100) * 1.9)}s` }}
              />

              {/* Pulsing event horizon core */}
              <div className="wormhole-core" />

              {/* Glowing nebula background */}
              <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-3xl animate-pulse -z-10" />
            </div>
          </div>
        )}

        {/* Hard Scroll Visual Tension Trigger Banner */}
        {overscrollProgress > 0 && (
          <div className="fixed bottom-0 left-0 w-full z-40 px-6 py-4 bg-slate-950/85 backdrop-blur-md border-t border-amber-500/40 transition-all duration-150 flex flex-col items-center gap-2 pointer-events-none shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
            <div className="text-amber-400 font-lexend font-bold text-xs md:text-sm tracking-widest uppercase flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <span>⚡ Keep scrolling hard to break through into Project Archives... {Math.round(overscrollProgress)}%</span>
            </div>
            <div className="w-full max-w-md h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                style={{ width: `${overscrollProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <Script src="https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/oneko/oneko.js" strategy="afterInteractive" data-cat="https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/oneko/oneko.gif" />
    </>
  );
}

