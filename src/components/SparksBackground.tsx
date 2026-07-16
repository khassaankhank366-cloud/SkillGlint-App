import { useRef, useEffect } from 'react';

export function SparksBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    const particles: { x: number; y: number; vy: number; size: number; alpha: number }[] = [];
    const spawn = () => {
      if (particles.length >= 50) return;
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vy: 0.8 + Math.random() * 1.2,
        size: 0.8 + Math.random() * 1.2,
        alpha: 0.15 + Math.random() * 0.35
      });
    };
    const animate = () => {
      ctx.fillStyle = 'rgba(11, 15, 25, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y += p.vy;
        const gradient = ctx.createLinearGradient(p.x, p.y - 25, p.x, p.y);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, `rgba(34, 211, 238, ${p.alpha})`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - 25);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        if (p.y > canvas.height) particles.splice(i, 1);
      }
      if (particles.length < 50) spawn();
      animationId = requestAnimationFrame(animate);
    };
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    animate();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
