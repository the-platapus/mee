"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import MoreInfo from "@/components/MoreInfo";
import HomePage from "@/components/HomePage";
import "./globals.css";
import "./fireflies.css";

export default function Home() {
  const [isSplashLoaded, setIsSplashLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgSrc, setBgSrc] = useState("");
  const [blurAmount, setBlurAmount] = useState(0);

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      // Blur increases by 1px for every 10% of viewport scrolled, up to 10px
      const newBlur = Math.min(scrollY / (viewportHeight * 0.1), 10);
      setBlurAmount(newBlur);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
      <div className="relative z-10 w-full min-h-screen animate-fadeIn">
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
      </div>
      <Script src="/oneko/oneko.js" strategy="afterInteractive" data-cat="/oneko/oneko.gif" />
    </>
  );
}
