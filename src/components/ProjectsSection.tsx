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
  const [typographyIndex, setTypographyIndex] = useState<number>(0);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const typographyRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef<number>(0);
  const slideWrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const darkeningOverlaysRef = useRef<(HTMLDivElement | null)[]>([]);
  const targetIndexRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get active project object
  const activeProject: Project = useMemo(() => {
    return showcaseProjects[activeIndex] || showcaseProjects[0];
  }, [activeIndex]);

  // Get displayed project object for typography (only updates when settled/invisible)
  const typographyProject: Project = useMemo(() => {
    return showcaseProjects[typographyIndex] || showcaseProjects[0];
  }, [typographyIndex]);

  // Automated carousel interval for project slideshow images
  useEffect(() => {
    if (isPaused || activeProject.images.length <= 1) return;

    const timer = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % activeProject.images.length);
    }, 4200);

    return () => clearInterval(timer);
  }, [activeProject, isPaused]);

  // Clean up scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Smooth scroll to a specific project index
  const scrollToProject = useCallback((index: number) => {
    if (!scrollerRef.current) return;
    const height = scrollerRef.current.clientHeight;

    targetIndexRef.current = index;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      targetIndexRef.current = null;
    }, 850);

    if (typographyRef.current) {
      typographyRef.current.style.transition = "opacity 0.2s ease-out 0s, filter 0.2s ease-out 0s";
      typographyRef.current.style.opacity = "0";
      typographyRef.current.style.filter = "blur(18px)";
    }

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
    if (targetIndexRef.current !== null) {
      if (newIndex === targetIndexRef.current && Math.abs(scrollTop - targetIndexRef.current * height) < 5) {
        targetIndexRef.current = null;
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      }
    } else if (newIndex !== activeIndexRef.current && newIndex >= 0 && newIndex < showcaseProjects.length) {
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
      wrapper.style.borderRadius = "40px";
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
        setTypographyIndex((prev) => (prev !== closestIndex ? closestIndex : prev));
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

  // Intercept wheel and touch scroll gestures anywhere in the section to scroll through projects
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (targetIndexRef.current !== null) {
        targetIndexRef.current = null;
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      }
      if (e.touches.length !== 1) return;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const scroller = scrollerRef.current;
      if (!scroller || e.touches.length !== 1) return;
      if (scroller.contains(e.target as Node)) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = touchStartY - currentY;
      const deltaX = touchStartX - currentX;

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        const { scrollTop, scrollHeight, clientHeight } = scroller;
        const maxScroll = scrollHeight - clientHeight;
        if (maxScroll <= 0) return;

        if ((deltaY > 0 && scrollTop < maxScroll - 2) || (deltaY < 0 && scrollTop > 2)) {
          e.preventDefault();
          scroller.style.scrollBehavior = "auto";
          scroller.scrollTop += deltaY;
          touchStartY = currentY;
          touchStartX = currentX;

          if ((scroller as any)._resetTimer) clearTimeout((scroller as any)._resetTimer);
          (scroller as any)._resetTimer = setTimeout(() => {
            if (scroller) scroller.style.scrollBehavior = "smooth";
          }, 60);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (targetIndexRef.current !== null) {
        targetIndexRef.current = null;
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      }
      const scroller = scrollerRef.current;
      if (!scroller) return;
      if (scroller.contains(e.target as Node)) return;

      const { scrollTop, scrollHeight, clientHeight } = scroller;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) return;

      if ((e.deltaY > 0 && scrollTop < maxScroll - 2) || (e.deltaY < 0 && scrollTop > 2)) {
        e.preventDefault();
        scroller.style.scrollBehavior = "auto";
        scroller.scrollTop += e.deltaY;

        if ((scroller as any)._resetTimer) clearTimeout((scroller as any)._resetTimer);
        (scroller as any)._resetTimer = setTimeout(() => {
          if (scroller) scroller.style.scrollBehavior = "smooth";
        }, 60);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="projects"
      className="projects-viewport-lock select-none bg-transparent snap-start relative flex flex-row items-center justify-between overflow-hidden w-full h-screen min-h-screen max-h-screen overscroll-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left Side: Horizontally & Vertically Centered Typography with Generous Wall Padding */}
      <div
        ref={typographyRef}
        className="projects-typography-side w-1/2 h-full z-20 flex flex-col justify-center items-start text-left px-8 sm:px-12 md:px-16 lg:px-24 will-change-[opacity,filter]"
        style={{ opacity: 1, filter: "blur(0px)" }}
      >
        <div className="projects-typography-content pointer-events-auto w-full max-w-[42vw] text-left">
          <Draggable className="block w-fit mb-2">
            <h1 className="project-title text-[3.8vw] font-extrabold tracking-tight text-white m-0 font-lexend leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              {typographyProject.title}
            </h1>
          </Draggable>
          <Draggable className="block w-fit mb-4">
            <p className="project-subtitle text-amber-400 font-semibold text-[1.4vw] m-0 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {typographyProject.subtitle}
            </p>
          </Draggable>

          {/* Tech Stack Chips (Each individually draggable) */}
          {/* <div className="pt-2 flex flex-wrap items-center">
            {typographyProject.techStack.map((tech) => (
              <Draggable key={tech} className="inline-block mr-2 mb-2">
                <span className="tech-chip shadow-lg backdrop-blur-md bg-slate-900/60 !m-0 block ">
                  {tech}
                </span>
              </Draggable>
            ))}
          </div> */}

          {/* Carousel Manual Dots & Image Counter */}
          {typographyProject.images.length > 1 && (
            <div className="pt-4 flex items-center gap-4">
              <Draggable className="inline-block">
                <div className="carousel-indicators px-3.5 py-2 rounded-full bg-slate-900/60 backdrop-blur-md shadow-lg">
                  {typographyProject.images.map((_, idx) => (
                    <button
                      key={idx}
                      aria-label={`Select photo ${idx + 1}`}
                      onClick={() => setImageIndex(idx)}
                      className={`indicator-dot ${idx === imageIndex ? "active" : ""}`}
                    />
                  ))}
                </div>
              </Draggable>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Pure Block Relative Wrapper ensuring standard CSS absolute positioning against Far Right Wall */}
      <div className="projects-slideshow-side m-25 w-1/2 h-full relative z-10 block p-0">
        {/* Inner Flex Container exclusively dedicated to centering the Slideshow Card */}
        <div className="w-full h-full flex items-center justify-center">
          {/* Slideshow Card with direct right margin spacing */}
          <div
            className="projects-slideshow-card w-[95%] max-w-[660px] mr-16 sm:mr-20 md:mr-24 h-[64vh] sm:h-[68vh] rounded-[2.5rem] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.7)] bg-slate-950/80 relative group transition-all duration-500 hover:shadow-[0_25px_80px_rgba(236,147,63,0.15)] [clip-path:inset(0_round_2.5rem)]"
            style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
          >
            {/* Vertically Snap-Scrolling Backgrounds */}
            <div
              ref={scrollerRef}
              onScroll={updateScrollAnimations}
              className="w-full h-full overflow-y-auto snap-y snap-mandatory no-scrollbar relative z-10 overscroll-contain"
              style={{ scrollBehavior: "smooth" }}
            >
              {showcaseProjects.map((proj, projIndex) => {
                const isCurrentProject = projIndex === activeIndex;
                const currentImgUrl = proj.images[isCurrentProject ? imageIndex : 0] || "";

                return (
                  <div
                    key={proj.id}
                    className="w-full h-full snap-start relative flex-shrink-0 overflow-hidden bg-black flex items-center justify-center rounded-[2.5rem]"
                  >
                    {/* Animated inner picture wrapper that zooms out & zooms in */}
                    <div
                      ref={(el) => {
                        slideWrappersRef.current[projIndex] = el;
                      }}
                      className="w-full h-full relative origin-center rounded-[2.5rem] overflow-hidden [clip-path:inset(0_round_2.5rem)] transition-none will-change-transform"
                      style={{
                        transform: projIndex === 0 ? "scale(1)" : "scale(0.85)",
                        WebkitMaskImage: "-webkit-radial-gradient(white, black)"
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
      </div>

      {/* Absolute Foreground: Vertical Navigation Bar Anchored directly to Far Right Wall of the Screen */}
      <div
        className="projects-vertical-nav pointer-events-none"
        style={{ position: "absolute", right: "1.5rem", left: "auto", top: "50%", transform: "translateY(-50%)", zIndex: 9999 }}
      >
        <Draggable className="inline-block pointer-events-auto">
          <div className="flex flex-col items-center bg-slate-950/80 backdrop-blur-md py-6 px-3 sm:px-3.5 rounded-full">
            {showcaseProjects.map((proj, idx) => {
              const isCurrent = idx === activeIndex;
              return (
                <button
                  key={proj.id}
                  aria-label={`Switch to ${proj.title}`}
                  onClick={() => scrollToProject(idx)}
                  className={`indicator-dot vertical ${isCurrent ? "active" : ""}`}
                />
              );
            })}
            <div className="section-vertical-label flex flex-col items-center mt-2 gap-1 text-[1.5vw] text-amber-400 font-extrabold select-none uppercase">
              {activeProject.section.split("").map((char, index) => (
                <span key={index} className="block text-center leading-none">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </div>
          </div>
        </Draggable>
      </div>
    </div>
  );
}
