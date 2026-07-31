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
  const [isProjectsActive, setIsProjectsActive] = useState(false);
  const [isProjectsLoaded, setIsProjectsLoaded] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const handleProjectsClick = () => {
    setIsProjectsLoaded(true);
    // Wait for ProjectsSection to render, then scroll to it
    setTimeout(() => {
      const el = document.getElementById("projects");
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashLoaded(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

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

      {/* Standalone Cinematic Radial-Gradient Vignette applied over website background when in Projects Section */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-none transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
        style={{
          background: "radial-gradient(circle at center, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.85) 90%)",
          opacity: isProjectsActive ? 1 : 0,
          transform: isProjectsActive ? "scale(1)" : "scale(1.05)",
          zIndex: 1,
        }}
      />

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
            <MoreInfo onUnlockProjects={handleProjectsClick} />
            {isProjectsLoaded && (
              <ProjectsSection onActiveChange={setIsProjectsActive} />
            )}
          </>
        ) : null}
      </div>

      <Script src="https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/oneko/oneko.js" strategy="afterInteractive" data-cat="https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/oneko/oneko.gif" />
    </>
  );
}
