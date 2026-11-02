import confetti from 'canvas-confetti';

export function triggerGoldSparkle(x = 0.5, y = 0.5) {
  // Respect prefers-reduced-motion
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  confetti({
    particleCount: 28,
    spread: 55,
    origin: { x, y },
    colors: ['#D4AF37', '#E5C458', '#F5F0E1', '#B08E24'],
    startVelocity: 18,
    ticks: 60,
    gravity: 0.9,
    shapes: ['star', 'circle'],
    scalar: 0.8,
    disableForReducedMotion: true,
  });
}
