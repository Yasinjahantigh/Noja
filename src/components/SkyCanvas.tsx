import React, { useEffect, useRef, useState } from 'react';
import { Thought, Emotion } from '../types';
import { getEmotionColor } from '../lib/colors';

interface SkyCanvasProps {
  thoughts: Thought[];
  width: number;
  height: number;
  centerTrigger: number;
}

interface Particle {
  x: number;
  y: number;
  speed: number;
  alpha: number;
  size: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;
}

export const SkyCanvas: React.FC<SkyCanvasProps> = ({ thoughts, width, height, centerTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverPosRef = useRef<{ x: number, y: number } | null>(null);
  const [hoveredThought, setHoveredThought] = useState<Thought | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  
  const panRef = useRef({ x: 0, y: 0 });
  const targetPanRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const targetZoomRef = useRef(1);

  const pointersRef = useRef<Map<number, {x: number, y: number}>>(new Map());
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    targetPanRef.current = { x: 0, y: 0 };
    targetZoomRef.current = 1;
  }, [centerTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 0.001;
      targetZoomRef.current = Math.max(0.1, Math.min(targetZoomRef.current - e.deltaY * zoomFactor, 3));
      hoverPosRef.current = null;
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    if (particlesRef.current.length === 0) {
      const p: Particle[] = [];
      const count = 300;
      const colors = ['#ffffff', '#93c5fd', '#fde047', '#f87171', '#c4b5fd'];
      for (let i = 0; i < count; i++) {
        p.push({
          x: Math.random() * width * 4 - width * 2,
          y: Math.random() * height * 4 - height * 2,
          speed: 0.02 + Math.random() * 0.08,
          alpha: Math.random(),
          size: 0.5 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      particlesRef.current = p;
    }
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let reqId: number;
    const tooltipDiv = document.getElementById('sky-tooltip');

    const render = () => {
      if (!isDraggingRef.current) {
        panRef.current.x += (targetPanRef.current.x - panRef.current.x) * 0.1;
        panRef.current.y += (targetPanRef.current.y - panRef.current.y) * 0.1;
      }
      zoomRef.current += (targetZoomRef.current - zoomRef.current) * 0.1;

      ctx.fillStyle = '#050B14';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      ctx.save();
      const nParallaxX = panRef.current.x * 0.2;
      const nParallaxY = panRef.current.y * 0.2;
      ctx.translate(cx + nParallaxX, cy + nParallaxY);
      ctx.scale(zoomRef.current * 0.8 + 0.2, zoomRef.current * 0.8 + 0.2);
      ctx.globalCompositeOperation = 'screen';
      
      const drawNebula = (nx: number, ny: number, r: number, color: string) => {
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fill();
      };

      drawNebula(-width * 0.1, -height * 0.2, width * 0.8, 'rgba(49, 10, 102, 0.25)');
      drawNebula(width * 0.3, height * 0.3, width * 0.7, 'rgba(8, 47, 73, 0.3)');
      drawNebula(-width * 0.2, height * 0.1, width * 0.5, 'rgba(88, 28, 135, 0.15)');

      ctx.restore();

      const time = Date.now() / 1000;

      particlesRef.current.forEach((p) => {
        p.y -= p.speed;
        p.alpha += Math.sin(time + p.x) * 0.01;
        
        if (p.alpha < 0) p.alpha = 0;
        if (p.alpha > 0.8) p.alpha = 0.8;
        
        const depth = p.size;
        let px = cx + (p.x + panRef.current.x * depth) * zoomRef.current;
        let py = cy + (p.y + panRef.current.y * depth) * zoomRef.current;
        
        const boundW = width * 1.5;
        const boundH = height * 1.5;
        px = ((px % boundW) + boundW) % boundW - (boundW - width) / 2;
        py = ((py % boundH) + boundH) % boundH - (boundH - height) / 2;

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.arc(px, py, p.size * Math.max(0.2, zoomRef.current), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      if (Math.random() < 0.005) {
        shootingStarsRef.current.push({
          x: Math.random() * width * 1.5,
          y: -100,
          length: 50 + Math.random() * 100,
          speedX: -2 - Math.random() * 3,
          speedY: 2 + Math.random() * 5,
          life: 0,
          maxLife: 100 + Math.random() * 50
        });
      }

      ctx.save();
      for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
        const star = shootingStarsRef.current[i];
        star.x += star.speedX;
        star.y += star.speedY;
        star.life++;
        
        const opacity = Math.max(0, 1 - (star.life / star.maxLife));
        const grad = ctx.createLinearGradient(star.x, star.y, star.x - star.speedX * star.length * 0.1, star.y - star.speedY * star.length * 0.1);
        grad.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.8})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.speedX * star.length * 0.1, star.y - star.speedY * star.length * 0.1);
        ctx.stroke();

        if (star.life >= star.maxLife) {
          shootingStarsRef.current.splice(i, 1);
        }
      }
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoomRef.current, zoomRef.current);
      ctx.translate(-cx, -cy);
      ctx.translate(panRef.current.x, panRef.current.y);

      ctx.lineWidth = 1.5 / Math.max(0.5, zoomRef.current);
      thoughts.forEach(t => {
        if (t.connectedToId) {
          const parent = thoughts.find(p => p.id === t.connectedToId);
          if (parent) {
            ctx.beginPath();
            ctx.moveTo(t.x, t.y);
            ctx.lineTo(parent.x, parent.y);
            
            ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`;
            ctx.stroke();
          }
        }
      });

      let currentHover: Thought | null = null;
      const hoverMargin = 20 / zoomRef.current;

      thoughts.forEach((t, i) => {
        const { rgb, size } = getEmotionColor(t.emotion);
        
        const breathe = Math.sin(time * 1.5 + i) * 0.15 + 0.85; 
        const currentSize = size * breathe;

        let isHovered = false;
        if (hoverPosRef.current && !isDraggingRef.current) {
          const dx = hoverPosRef.current.x - t.x;
          const dy = hoverPosRef.current.y - t.y;
          if (dx*dx + dy*dy < (currentSize * 2 + hoverMargin) * (currentSize * 2 + hoverMargin)) {
            isHovered = true;
            currentHover = t;
          }
        }

        const radius = isHovered ? currentSize * 5 : currentSize * 3.5;
        
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb}, ${isHovered ? 0.3 : 0.15})`;
        ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb}, ${isHovered ? 0.15 : 0.05})`;
        ctx.arc(t.x, t.y, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgb(${rgb})`;
        ctx.arc(t.x, t.y, currentSize * (isHovered ? 1.4 : 1), 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.arc(t.x, t.y, currentSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      if (tooltipDiv) {
        if (currentHover && !isDraggingRef.current) {
          const screenX = cx + (currentHover.x - cx + panRef.current.x) * zoomRef.current;
          const screenY = cy + (currentHover.y - cy + panRef.current.y) * zoomRef.current;

          tooltipDiv.style.opacity = '1';
          
          const tooltipWidth = 250;
          let left = screenX + 15;
          let top = screenY + 15;
          
          if (left + tooltipWidth > width) {
            left = screenX - tooltipWidth - 15;
          }
          if (top + 100 > height) {
            top = screenY - 100;
          }
          
          tooltipDiv.style.left = `${left}px`;
          tooltipDiv.style.top = `${top}px`;
          const tooltipInner = tooltipDiv.querySelector('div');
          if (tooltipInner) {
            tooltipInner.textContent = currentHover.text;
          }
        } else {
          tooltipDiv.style.opacity = '0';
        }
      }

      if (currentHover !== hoveredThought) {
        setHoveredThought(currentHover);
      }

      reqId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(reqId);
  }, [thoughts, width, height]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = { 
        x: e.clientX - targetPanRef.current.x * zoomRef.current, 
        y: e.clientY - targetPanRef.current.y * zoomRef.current 
      };
    } 
    else if (pointersRef.current.size === 2) {
      isDraggingRef.current = false;
      const pts = Array.from(pointersRef.current.values()) as { x: number, y: number }[];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      initialPinchDistRef.current = dist;
      initialZoomRef.current = targetZoomRef.current;
    }
    
    if (e.target instanceof Element) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const rect = canvasRef.current?.getBoundingClientRect();
    const cx = rect ? e.clientX - rect.left : e.clientX;
    const cy = rect ? e.clientY - rect.top : e.clientY;

    if (pointersRef.current.size === 1 && isDraggingRef.current) {
      targetPanRef.current = {
        x: (e.clientX - dragStartRef.current.x) / zoomRef.current,
        y: (e.clientY - dragStartRef.current.y) / zoomRef.current
      };
      hoverPosRef.current = null;
    } else if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values()) as { x: number, y: number }[];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (initialPinchDistRef.current && initialPinchDistRef.current > 0) {
        const scale = dist / initialPinchDistRef.current;
        targetZoomRef.current = Math.max(0.1, Math.min(initialZoomRef.current * scale, 3));
      }
    } else if (pointersRef.current.size === 0 || (!isDraggingRef.current && pointersRef.current.size === 1)) {
      const wX = (cx - width / 2) / zoomRef.current + width / 2 - panRef.current.x;
      const wY = (cy - height / 2) / zoomRef.current + height / 2 - panRef.current.y;
      
      hoverPosRef.current = { x: wX, y: wY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(e.pointerId);
    
    if (pointersRef.current.size < 2) {
      initialPinchDistRef.current = null;
    }
    
    if (pointersRef.current.size === 0) {
      isDraggingRef.current = false;
    } else if (pointersRef.current.size === 1) {
      const pts = Array.from(pointersRef.current.values()) as { x: number, y: number }[];
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: pts[0].x - targetPanRef.current.x * zoomRef.current,
        y: pts[0].y - targetPanRef.current.y * zoomRef.current
      };
    }

    if (e.target instanceof Element) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerLeave = () => {
    hoverPosRef.current = null;
    setHoveredThought(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        id="sky-canvas"
        ref={canvasRef}
        width={width}
        height={height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="block cursor-grab active:cursor-grabbing touch-none"
      />
      
      <div 
        id="sky-tooltip"
        className="absolute transition-opacity duration-300 max-w-xs opacity-0 z-50 pointer-events-none"
        style={{ left: 0, top: 0, willChange: 'top, left, opacity', width: 'max-content', maxWidth: '300px' }}
      >
        <div className="bg-slate-50/95 backdrop-blur-3xl text-[#0f172a] px-5 py-3 rounded-2xl border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-base font-semibold font-serif leading-relaxed drop-shadow-md" dir="rtl">
        </div>
      </div>
    </div>
  );
};
