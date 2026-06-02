"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

export default function MotionSmoke() {
  const dotRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced || !dotRef.current) return;

    gsap.fromTo(
      dotRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
    );
  });

  return (
    <div
      ref={dotRef}
      className="h-3 w-3 rounded-full bg-indigo-500"
      aria-hidden="true"
    />
  );
}
