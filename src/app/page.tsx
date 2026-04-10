"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import MoreInfo from "./moreinfo/page";
import HomePage from "./home/page";
import "./globals.css";
import "./fireflies.css";

export default function Home() {
  const [isSplashLoaded, setIsSplashLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgSrc, setBgSrc] = useState("");
  const [blurAmount, setBlurAmount] = useState(0);

  useEffect(() => {
    const smolImg = "/assets/images/plsloadgoddamnitsmol.webp";
    const fullImg = "/assets/images/plsloadgoddamnit.png";

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
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      // Blur increases by 1px for every 10% of viewport scrolled, up to 10px
      const newBlur = Math.min(scrollY / (viewportHeight * 0.1), 10);
      setBlurAmount(newBlur);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashLoaded(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);


  return (
    <>
      <div
        id="bg-layer"
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: bgSrc ? `url("${bgSrc}")` : "none",
          backgroundColor: "#2b3a4f",
          zIndex: -1,
          filter: `blur(${blurAmount}px)`,
          transform: `scale(${1 + blurAmount * 0.015})`,
          transition: "filter 0.3s ease-out, transform 0.3s ease-out"
        }}
      />
      <div className="relative z-10 w-full min-h-screen">
        {isSplashLoaded ? (
          <>
            <HomePage />
          </>
        ) : null}
        {isLoaded ? (
          <>
            <MoreInfo />
            {/* Fireflies divs */}
            <div className="firefly"></div>
            <div className="firefly"></div>
            <div className="firefly"></div>
            <div className="firefly"></div>
            <div className="firefly"></div>
            <div className="firefly"></div>
            <div className="firefly"></div>
          </>
        ) : null}
      </div>
      <Script src="https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/oneko/oneko.js" strategy="afterInteractive" data-cat="https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/oneko/oneko.gif" />
    </>
  );
}
