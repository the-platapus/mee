"use client";

import { useEffect, useState } from "react";

const skills = [
  "Android, iOS and Symbian Dev",
  "PC Hardware and ICE Enthusiast",
  "3D Artist and Photographer/Videographer",
];

export default function Home() {
  const [skillIndex, setSkillIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex < skills[skillIndex].length) {
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev + skills[skillIndex].charAt(charIndex));
        setCharIndex(charIndex + 1);
      }, 75);
    } else if (!isDeleting && charIndex === skills[skillIndex].length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1500);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayText(skills[skillIndex].substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, 27);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setSkillIndex((prev) => (prev + 1) % skills.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, skillIndex]);

  useEffect(() => {
    document.body.classList.add("loaded");
  }, []);

  return (
    <>
      <h1>Abdullah Aamir</h1>
      <div className="header-icons">
        <a
          aria-label="My Github Profile"
          target="_self"
          href="https://github.com/the-platapus"
          rel="noreferrer"
        >
          <i className="icon fa-brands fa-github" aria-hidden="true"></i>
        </a>
        <a
          aria-label="Send Email"
          href="mailto:abu378072@gmail.com"
          target="_blank"
          rel="noreferrer"
        >
          <i className="icon fa-solid fa-envelope" aria-hidden="true"></i>
        </a>
        <a
          aria-label="Next Page"
          target="_self"
          href="https://sites.google.com/view/abdullah1325/who-is-the_platapus"
          rel="noreferrer"
        >
          <i className="icon fa-solid fa-circle-arrow-right colo"></i>
        </a>
      </div>
      <p className="tagline">
        <span id="typing">{displayText}</span>
        <span className="cursor"></span>
      </p>

      {/* Fireflies divs */}
      <div className="firefly"></div>
      <div className="firefly"></div>
      <div className="firefly"></div>
      <div className="firefly"></div>
      <div className="firefly"></div>
      <div className="firefly"></div>
      <div className="firefly"></div>
    </>
  );
}
