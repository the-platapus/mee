/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { showcaseProjects, Project } from "@/data/projects";
import "./projects.css";

export default function ProjectsSection() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const typographyRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef<number>(0);
  const slideWrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const darkeningOverlaysRef = useRef<(HTMLDivElement | null)[]>([]);

  // Get active project object
  const activeProject: Project = useMemo(() => {
    return showcaseProjects[activeIndex] || showcaseProjects[0];
  }, [activeIndex]);

  // Automated carousel interval for project slideshow images
  useEffect(() => {
    if (isPaused || activeProject.images.length <= 1) return;

    const timer = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % activeProject.images.length);
    }, 4200);

    return () => clearInterval(timer);
  }, [activeProject, isPaused]);

  // Smooth scroll to a specific project index
  const scrollToProject = useCallback((index: number) => {
    if (!scrollerRef.current) return;
    const height = scrollerRef.current.clientHeight;
    scrollerRef.current.scrollTo({
      top: index * height,
      behavior: "smooth",
    });
    activeIndexRef.current = index;
    setActiveIndex(index);
    setImageIndex(0);
  }, []);

  // Real-time GPU-accelerated scroll physics for zoom & darken transitions
  const updateScrollAnimations = useCallback(() => {
    if (!scrollerRef.current) return;
    const scrollTop = scrollerRef.current.scrollTop;
    const height = scrollerRef.current.clientHeight;
    if (height <= 0) return;

    const newIndex = Math.round(scrollTop / height);
    if (newIndex !== activeIndexRef.current && newIndex >= 0 && newIndex < showcaseProjects.length) {
      activeIndexRef.current = newIndex;
      setActiveIndex(newIndex);
      setImageIndex(0);
    }

    // Apply real-time parallax scaling and darkening to each project picture
    showcaseProjects.forEach((_, idx) => {
      const wrapper = slideWrappersRef.current[idx];
      const overlay = darkeningOverlaysRef.current[idx];
      if (!wrapper || !overlay) return;

      const distance = Math.abs(scrollTop - idx * height);
      const progress = Math.min(1, Math.max(0, distance / height)); // 0 = centered in viewport, 1 = scrolled away

      // Zoom out slightly as picture scrolls away (1.0 -> 0.85)
      const scale = 1 - 0.15 * progress;
      // Darken picture slightly as it transitions out (0.0 -> 0.75 opacity)
      const darkOpacity = progress * 0.75;

      wrapper.style.transform = `scale(${scale})`;
      wrapper.style.borderRadius = `${progress * 32}px`;
      overlay.style.opacity = `${darkOpacity}`;
    });

    // Asymmetrical blur-out on departure vs. lazy blur-in at end of scroll
    if (typographyRef.current) {
      const closestIndex = Math.round(scrollTop / height);
      const offsetFromCenter = Math.abs(scrollTop - closestIndex * height);
      const isSettled = offsetFromCenter < height * 0.08;

      if (!isSettled) {
        // Instant response on departure so blur-out never gets skipped even on fast scrolls
        typographyRef.current.style.transition = "opacity 0.2s ease-out 0s, filter 0.2s ease-out 0s";
        typographyRef.current.style.opacity = "0";
        typographyRef.current.style.filter = "blur(18px)";
      } else {
        // Lazy and slow un-blur with an intentional pause at the conclusion of the scroll
        typographyRef.current.style.transition = "opacity 0.95s cubic-bezier(0.16, 1, 0.3, 1) 0.25s, filter 0.95s cubic-bezier(0.16, 1, 0.3, 1) 0.25s";
        typographyRef.current.style.opacity = "1";
        typographyRef.current.style.filter = "blur(0px)";
      }
    }
  }, []);

  // Initialize scroll styles and bind resize observer
  useEffect(() => {
    updateScrollAnimations();
    window.addEventListener("resize", updateScrollAnimations);
    return () => window.removeEventListener("resize", updateScrollAnimations);
  }, [updateScrollAnimations]);

  // Support seamless keyboard navigation across projects
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = (activeIndex + 1) % showcaseProjects.length;
        scrollToProject(nextIndex);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = (activeIndex - 1 + showcaseProjects.length) % showcaseProjects.length;
        scrollToProject(prevIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, scrollToProject]);

  return (
    <div
      className="projects-viewport-lock select-none bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Vertically Snap-Scrolling Backgrounds */}
      <div
        ref={scrollerRef}
        onScroll={updateScrollAnimations}
        className="w-full h-full overflow-y-auto snap-y snap-mandatory no-scrollbar relative z-10"
        style={{ scrollBehavior: "smooth" }}
      >
        {showcaseProjects.map((proj, projIndex) => {
          const isCurrentProject = projIndex === activeIndex;
          const currentImgUrl = proj.images[isCurrentProject ? imageIndex : 0] || "";

          return (
            <div
              key={proj.id}
              className="w-full h-full snap-start relative flex-shrink-0 overflow-hidden bg-black flex items-center justify-center"
            >
              {/* Animated inner picture wrapper that zooms out & zooms in */}
              <div
                ref={(el) => {
                  slideWrappersRef.current[projIndex] = el;
                }}
                className="w-full h-full relative origin-center overflow-hidden transition-none will-change-transform"
                style={{
                  transform: projIndex === 0 ? "scale(1)" : "scale(0.85)",
                }}
              >
                {/* Deep ambient blurred background layer */}
                <div
                  className="slideshow-blur-layer"
                  style={{ backgroundImage: `url("${currentImgUrl}")` }}
                />

                {/* High-res foreground screenshot layer */}
                {proj.images.map((img, idx) => (
                  <img
                    key={img}
                    src={img}
                    alt={`${proj.title} screenshot ${idx + 1}`}
                    className={`slideshow-sharp-layer ${
                      !isCurrentProject ? (idx === 0 ? "active" : "inactive") : idx === imageIndex ? "active" : "inactive"
                    }`}
                  />
                ))}

                {/* Contrast vignette overlay */}
                <div className="slideshow-vignette" />

                {/* Real-time darkening & un-darkening overlay */}
                <div
                  ref={(el) => {
                    darkeningOverlaysRef.current[projIndex] = el;
                  }}
                  className="absolute inset-0 bg-black z-10 pointer-events-none transition-none will-change-opacity"
                  style={{
                    opacity: projIndex === 0 ? 0 : 0.75,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed In-Place Foreground: Top-Left Project Info */}
      <div
        ref={typographyRef}
        className="fixed top-0 left-0 z-20 pt-8 pl-8 md:pt-14 md:pl-16 pr-8 max-w-3xl text-left pointer-events-none will-change-[opacity,filter]"
        style={{ opacity: 1, filter: "blur(0px)" }}
      >
        <div className="pointer-events-auto">
          <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight text-white m-0 pb-2 font-lexend leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            {activeProject.title}
          </h1>
          <p className="text-amber-400 font-semibold text-sm md:text-lg m-0 pb-4 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {activeProject.subtitle}
          </p>

          {/* Tech Stack Chips */}
          <div className="pt-2 flex flex-wrap items-center">
            {activeProject.techStack.map((tech) => (
              <span key={tech} className="tech-chip shadow-lg backdrop-blur-md bg-slate-900/40">
                {tech}
              </span>
            ))}
          </div>

          {/* Carousel Manual Dots (if multiple images exist for this project) */}
          {activeProject.images.length > 1 && (
            <div className="carousel-indicators pt-2">
              {activeProject.images.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Select photo ${idx + 1}`}
                  onClick={() => setImageIndex(idx)}
                  className={`indicator-dot ${idx === imageIndex ? "active" : ""}`}
                />
              ))}
              <span className="text-xs text-slate-300 ml-2 font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {imageIndex + 1} / {activeProject.images.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Subtle nav hint in top right corner */}
      <span className="fixed top-8 right-8 z-20 text-xs tracking-wider font-medium text-slate-400 uppercase hidden sm:block pointer-events-none drop-shadow-md">
        Scroll, Arrow Keys, or Click Dots to Navigate
      </span>

      {/* Fixed In-Place Foreground: Bottom Dot Navigation & Section Name */}
      <div className="fixed bottom-0 left-0 w-full z-20 pb-10 flex justify-center items-center pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-950/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.6)] pointer-events-auto">
          {showcaseProjects.map((proj, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <button
                key={proj.id}
                aria-label={`Switch to ${proj.title}`}
                onClick={() => scrollToProject(idx)}
                className={`indicator-dot ${isCurrent ? "active" : ""}`}
              />
            );
          })}
          <span className="text-xs text-amber-400 font-semibold tracking-wider uppercase ml-2">
            {activeProject.section}
          </span>
        </div>
      </div>
    </div>
  );
}
