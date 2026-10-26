"use client";

import { useEffect, useRef, useState } from "react";

const messages = [
  "Calculate with Confidence.",
  "Build Expertise.",
  "Engineer with Precision.",
];

export default function RotatingHeroText() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisible(false);

      timeoutRef.current = setTimeout(() => {
        setIndex((current) => (current + 1) % messages.length);
        setVisible(true);
      }, 400);
    }, 10000);

    return () => {
      window.clearInterval(interval);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <span
      className={`
        block
        transition-all
        duration-500
        ease-out
        ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0"
        }
      `}
    >
      {messages[index]}
    </span>
  );
}