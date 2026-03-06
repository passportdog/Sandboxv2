"use client";

import { useEffect, useRef } from "react";

interface Props {
  active: boolean;
}

export default function CinematicOverlays({ active }: Props) {
  const streakRef = useRef<HTMLDivElement>(null);
  const prevActive = useRef(false);

  useEffect(() => {
    if (active && !prevActive.current && streakRef.current) {
      // Re-trigger streak animation
      const el = streakRef.current;
      el.style.transition = "none";
      el.classList.remove("active");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition =
            "top 1.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out";
          el.classList.add("active");
        });
      });
    }
    prevActive.current = active;
  }, [active]);

  return (
    <>
      <div className={`bg-grid${active ? " active" : ""}`} />
      <div ref={streakRef} className="light-streak" />
    </>
  );
}
