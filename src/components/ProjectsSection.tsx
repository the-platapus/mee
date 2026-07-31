/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { showcaseProjects, Project } from "@/data/projects";
import "./projects.css";

interface DraggableProps {
  children: React.ReactNode;
  className?: string;
  resetOnDoubleClick?: boolean;
}

function Draggable({ children, className = "", resetOnDoubleClick = true }: DraggableProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, moved: false });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
      moved: false,
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) { }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (Math.hypot(dx, dy) > 4 && !dragRef.current.moved) {
      dragRef.current.moved = true;
      setIsDragging(true);
    }

    if (dragRef.current.moved) {
      setPosition({
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) { }
    }
    setIsDragging(false);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={() => resetOnDoubleClick && setPosition({ x: 0, y: 0 })}
      onClickCapture={(e) => {
        if (dragRef.current.moved) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      title={resetOnDoubleClick ? "Drag to move • Double-click to reset position" : "Drag to move"}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) ${isDragging ? "scale(1.03)" : "scale(1)"}`,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 9999 : position.x !== 0 || position.y !== 0 ? 100 : "auto",
        transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform",
      }}
      className={`relative select-none touch-none ${className} ${isDragging
          ? "drop-shadow-[0_20px_30px_rgba(236,147,63,0.4)] brightness-110 filter"
          : isHovered
            ? "drop-shadow-[0_8px_16px_rgba(255,255,255,0.15)]"
            : ""
        } transition-[filter,drop-shadow] duration-200`}
    >
      {children}
    </div>
  );
}

interface ProjectsSectionProps {
  onActiveChange?: (active: boolean) => void;
}

export default function ProjectsSection({ onActiveChange }: ProjectsSectionProps = {}) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
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

  // Observe viewport intersection to animate website background radial vignette when scrolling into section
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (onActiveChange) {
          onActiveChange(entry.isIntersecting);
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [onActiveChange]);

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

  // Support seamless keyboard navigation across projects when section is in viewport
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.5 || rect.bottom < window.innerHeight * 0.5) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = (activeIndex + 1) % showcaseProjects.length;
        scrollToProject(nextIndex);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = (activeIndex - 1 + showcaseProjects.length) % showcaseProjects.length;
        scrollToProject(prevIndex);
      } else if (e.key === "ArrowDown") {
        if (activeIndex < showcaseProjects.length - 1) {
          e.preventDefault();
          scrollToProject(activeIndex + 1);
        }
      } else if (e.key === "ArrowUp") {
        if (activeIndex > 0) {
          e.preventDefault();
          scrollToProject(activeIndex - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, scrollToProject]);

  return (
    <div
      ref={containerRef}
      id="projects"
      className="projects-viewport-lock select-none bg-transparent snap-start relative flex flex-row items-center justify-between overflow-hidden w-full h-screen"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left Side: Horizontally & Vertically Centered Typography with Generous Wall Padding */}
      <div
        ref={typographyRef}
        className="w-1/2 h-full z-20 flex flex-col justify-center items-center px-8 sm:px-12 md:px-16 lg:px-24 will-change-[opacity,filter]"
        style={{ opacity: 1, filter: "blur(0px)" }}
      >
        <div className="pointer-events-auto w-full max-w-lg text-left">
          <Draggable className="block w-fit mb-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white m-0 font-lexend leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              {activeProject.title}
            </h1>
          </Draggable>
          <Draggable className="block w-fit mb-4">
            <p className="text-amber-400 font-semibold text-sm sm:text-base md:text-lg m-0 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {activeProject.subtitle}
            </p>
          </Draggable>

          {/* Tech Stack Chips (Each individually draggable) */}
          <div className="pt-2 flex flex-wrap items-center">
            {activeProject.techStack.map((tech) => (
              <Draggable key={tech} className="inline-block mr-2 mb-2">
                <span className="tech-chip shadow-lg backdrop-blur-md bg-slate-900/60 !m-0 block border-white/10 hover:border-amber-400/40">
                  {tech}
                </span>
              </Draggable>
            ))}
          </div>

          {/* Carousel Manual Dots & Image Counter */}
          {activeProject.images.length > 1 && (
            <div className="pt-4 flex items-center gap-4">
              <Draggable className="inline-block">
                <div className="carousel-indicators px-3.5 py-2 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-lg">
                  {activeProject.images.map((_, idx) => (
                    <button
                      key={idx}
                      aria-label={`Select photo ${idx + 1}`}
                      onClick={() => setImageIndex(idx)}
                      className={`indicator-dot ${idx === imageIndex ? "active" : ""}`}
                    />
                  ))}
                </div>
              </Draggable>
              <Draggable className="inline-block">
                <span className="text-xs text-slate-200 font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-lg block">
                  {imageIndex + 1} / {activeProject.images.length}
                </span>
              </Draggable>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Snap-Scrolling Slideshow Container */}
      <div className="w-1/2 h-[76vh] sm:h-[80vh] relative z-10 flex flex-col justify-center px-4 sm:pr-12 md:pr-16 lg:pr-20 sm:pl-2">
        <div className="w-full h-full rounded-3xl overflow-hidden border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.7)] bg-slate-950/80 relative group transition-all duration-500 hover:border-amber-500/30 hover:shadow-[0_25px_80px_rgba(236,147,63,0.15)]">
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
                        className={`slideshow-sharp-layer ${!isCurrentProject ? (idx === 0 ? "active" : "inactive") : idx === imageIndex ? "active" : "inactive"
                          }`}
                      />
                    ))}

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
        </div>
      </div>

      {/* Subtle nav hint in top right corner - draggable & interactive */}
      <div className="absolute top-6 right-8 z-30 pointer-events-auto">
        <Draggable className="inline-block">
          <span className="text-xs tracking-wider font-medium text-slate-300 uppercase px-4 py-2 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)] block hover:border-amber-400/40 transition-colors">
            ✨ Scroll Slideshow, Arrow Keys, or Drag & Drop Typography
          </span>
        </Draggable>
      </div>

      {/* Absolute In-Place Foreground: Bottom Dot Navigation & Section Name */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 w-full z-30 flex justify-center items-center pointer-events-none">
        <Draggable className="inline-block pointer-events-auto">
          <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
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
            <span className="text-xs text-amber-400 font-semibold tracking-wider uppercase ml-2 select-none">
              {activeProject.section}
            </span>
          </div>
        </Draggable>
      </div>
    </div>
  );
}
