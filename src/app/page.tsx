"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Script from "next/script";
import dynamic from "next/dynamic";
import HomePage from "@/components/HomePage";

const MoreInfo = dynamic(() => import("@/components/MoreInfo"));
const ProjectsSection = dynamic(() => import("@/components/ProjectsSection"));
import "./globals.css";
import "./fireflies.css";

export default function Home() {
  const [isBgLoaded, setIsBgLoaded] = useState(false);
  const [isSplashLoaded, setIsSplashLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgSrc, setBgSrc] = useState("");
  const [blurAmount, setBlurAmount] = useState(0);
  const [isProjectsActive, setIsProjectsActive] = useState(false);
  const [isProjectsLoaded, setIsProjectsLoaded] = useState(false);

  const [isNextLoading, setIsNextLoading] = useState(false);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToElement = (id: string, onStopLoading: () => void) => {
    const startTime = Date.now();
    const MIN_FLASH_DURATION = 650; // Ensure 2 full high-contrast flashes are seen

    let attempts = 0;
    const interval = setInterval(() => {
      const el = document.getElementById(id);
      if (el) {
        clearInterval(interval);

        const elapsed = Date.now() - startTime;
        const delayBeforeScroll = Math.max(0, MIN_FLASH_DURATION - elapsed);

        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
          // Stop loading once smooth scroll has commenced
          setTimeout(() => {
            onStopLoading();
          }, 300);
        }, delayBeforeScroll);

        return;
      }
      attempts++;
      if (attempts > 50) {
        clearInterval(interval);
        onStopLoading(); // Give up after 5 seconds to reset button
      }
    }, 100);
  };

  const handleNextClick = () => {
    if (isNextLoading) return;
    setIsNextLoading(true);
    // Ensure the flashing state paints to screen immediately before the network fetch begins
    setTimeout(() => {
      setIsLoaded(true);
      scrollToElement("more-info", () => setIsNextLoading(false));
    }, 40);
  };

  const handleProjectsClick = () => {
    if (isProjectsLoading) return;
    setIsProjectsLoading(true);
    // Ensure the flashing state paints to screen immediately before the network fetch begins
    setTimeout(() => {
      setIsProjectsLoaded(true);
      scrollToElement("projects", () => setIsProjectsLoading(false));
    }, 40);
  };

  useEffect(() => {
    const smolImg = "https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/assets/images/plsloadgoddamnitsmol.webp";
    const fullImg = "https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/assets/images/plsloadgoddamnit.png";

    let isMounted = true;
    let smolAttempts = 0;
    const MAX_ATTEMPTS = 3;

    const loadHighRes = () => {
      if (!isMounted) return;
      const highResImg = new Image();
      highResImg.src = fullImg;
      highResImg.onload = () => {
        if (!isMounted) return;
        setBgSrc(fullImg);
      };
      highResImg.onerror = () => {
        console.error("Failed to load high-res background image.");
      };
    };

    const loadSmol = () => {
      if (!isMounted) return;
      const img = new Image();
      img.src = smolImg;
      
      img.onload = () => {
        if (!isMounted) return;
        setBgSrc(smolImg);
        setIsBgLoaded(true);
        
        // Give the browser time to paint the low-res background image before 
        // starting the heavy high-res download. On slow connections (like 3G), 
        // starting the high-res download immediately can block the render thread 
        // or delay the CSS background image fetch.
        requestAnimationFrame(() => {
          setTimeout(() => {
            loadHighRes();
          }, 100);
        });
      };
      
      img.onerror = () => {
        if (!isMounted) return;
        smolAttempts++;
        if (smolAttempts < MAX_ATTEMPTS) {
          console.warn(`Failed to load low-res background image (attempt ${smolAttempts}). Retrying...`);
          // Small delay before retry to prevent immediate rapid-fire requests
          setTimeout(loadSmol, 1000);
        } else {
          console.error("Failed to load low-res background image after 3 attempts. Attempting high-res fallback.");
          loadHighRes();
        }
      };
    };

    // Kick off the loading sequence starting with the low-res image
    loadSmol();

    return () => {
      isMounted = false;
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

  // Delay the HomePage mounting to preserve the cinematic title entry animation.
  // We wait 2 seconds so the 3-second background fade-in is bright enough to see it.
  useEffect(() => {
    if (isBgLoaded) {
      const timer = setTimeout(() => {
        setIsSplashLoaded(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isBgLoaded]);

  return (
    <>
      {/* Minimal Loader */}
      {!isBgLoaded && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}>
          <style>{`
            @keyframes minimalSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(245, 158, 11, 0.3)",
            borderTopColor: "#fbbf24",
            borderRadius: "50%",
            animation: "minimalSpin 1s linear infinite"
          }} />
        </div>
      )}

      <div
        id="bg-container"
        className="bg-container"
        style={{
          zIndex: -1,
          filter: `blur(${blurAmount}px)`,
          transform: `scale(${1 + blurAmount * 0.015})`,
          transition: "filter 0.3s ease-out, transform 0.3s ease-out"
        }}
      >
        <div
          id="bg-layer"
          className={`bg-layer ${isBgLoaded ? "animate-fadeIn" : "brightness-0"}`}
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

      {/* Standalone Cinematic Radial-Gradient Vignette applied over website background when in Projects Section */}
      <div
        className="projects-vignette"
        style={{
          background: "radial-gradient(circle at center, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.85) 90%)",
          opacity: isProjectsActive ? 1 : 0,
          transform: isProjectsActive ? "scale(1)" : "scale(1.05)",
          zIndex: 1,
        }}
      />

      <div
        ref={scrollContainerRef}
        className={`main-scroll-container no-scrollbar ${isBgLoaded ? "animate-fadeIn" : "opacity-0"}`}
      >
        {isSplashLoaded ? (
          <>
            <HomePage onUnlockScroll={handleNextClick} isLoading={isNextLoading} />
          </>
        ) : null}
        {isLoaded ? (
          <Suspense fallback={null}>
            <MoreInfo onUnlockProjects={handleProjectsClick} isLoading={isProjectsLoading} />
            {isProjectsLoaded && (
              <Suspense fallback={null}>
                <ProjectsSection onActiveChange={setIsProjectsActive} />
              </Suspense>
            )}
          </Suspense>
        ) : null}
      </div>

      <Script src="https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/oneko/oneko.js" strategy="afterInteractive" data-cat="https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/oneko/oneko.gif" />
    </>
  );
}
