"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
// import MoreInfo from "./moreinfo/page";
import HomePage from "./home/page";
import "./globals.css";
import "./fireflies.css";

export default function Home() {
  const [isSplashLoaded, setIsSplashLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Lazy load background image
    const loadBackgroundImage = () => {
      const img = new Image();
      img.src = "https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/assets/images/plsloadgoddamnitsmol.webp";

      img.onload = () => {
        // Apply the loaded image as background
        document.body.style.backgroundImage = `url(${img.src})`;
        document.body.classList.add("loaded");

        // Load the high-res version after the initial image loads
        const highResImg = new Image();
        highResImg.src = "https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/assets/images/plsloadgoddamnit.jpeg";

        highResImg.onload = () => {
          document.body.style.backgroundImage = `url(${highResImg.src})`;
        };
      };
    };

    loadBackgroundImage();
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
      {isSplashLoaded ? (
        <>
          <HomePage />
        </>
      ) : null}
      {isLoaded ? (
        <>
          {/* <MoreInfo /> */}
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
      <Script src="/oneko/oneko.js" strategy="afterInteractive" data-cat="/oneko/oneko.gif" />
    </>
  );
}
