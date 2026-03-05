'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

const confettiColors = [
  '#D6FF34', // neon green (brand)
  '#00FF8B', // vault usd
  '#4E6FFF', // vault eur
  '#FFAF4F', // vault btc
  '#FFBF00', // vault gold
  '#DA6AFF', // vault sol
];

function ConfettiPiece({ delay, color }: { delay: number; color: string }) {
  const randomX = Math.random() * 100;
  const randomRotation = Math.random() * 360;
  const randomScale = 0.5 + Math.random() * 0.5;

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{
        backgroundColor: color,
        left: `${randomX}%`,
        top: '-10px',
      }}
      initial={{
        y: -10,
        x: 0,
        rotate: 0,
        scale: randomScale,
        opacity: 1,
      }}
      animate={{
        y: window.innerHeight + 50,
        x: (Math.random() - 0.5) * 200,
        rotate: randomRotation,
        opacity: 0,
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    />
  );
}

export function Confetti({ active, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<Array<{ id: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    // Generate confetti pieces
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      delay: Math.random() * 0.5,
    }));

    setPieces(newPieces);

    // Auto-complete after animation
    const timeout = setTimeout(() => {
      onComplete?.();
      setPieces([]);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [active, onComplete]);

  if (!active && pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <ConfettiPiece
            key={piece.id}
            delay={piece.delay}
            color={piece.color}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}