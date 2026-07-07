'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const CHAOS_ICONS = [
  { emoji: '📝', label: 'Notion' },
  { emoji: '🐙', label: 'GitHub' },
  { emoji: '💬', label: 'Slack' },
  { emoji: '💻', label: 'VS Code' },
  { emoji: '🌐', label: 'Browser Tabs' },
  { emoji: '⬛', label: 'Terminal' },
  { emoji: '📄', label: 'Text File' },
  { emoji: '🔖', label: 'Bookmark' },
];

const ICON_SIZE = 36;

const CARDS = [
  { accent: '#3b82f6', titleW: '55%', line1: '80%', line2: '55%' },
  { accent: '#f59e0b', titleW: '55%', line1: '70%', line2: '45%' },
  { accent: '#06b6d4', titleW: '55%', line1: '85%', line2: '60%' },
  { accent: '#22c55e', titleW: '55%', line1: '65%', line2: '40%' },
  { accent: '#ec4899', titleW: '55%', line1: '75%', line2: '50%' },
  { accent: '#6366f1', titleW: '55%', line1: '90%', line2: '55%' },
  { accent: '#f97316', titleW: '55%', line1: '72%', line2: '48%' },
  { accent: '#10b981', titleW: '55%', line1: '83%', line2: '52%' },
];

export function HeroChaos() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;

    const particles = CHAOS_ICONS.map((icon, i) => {
      const el = document.createElement('div');
      el.style.cssText =
        'position:absolute;width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:18px;user-select:none;will-change:transform;';
      el.textContent = icon.emoji;
      el.title = icon.label;
      arena.appendChild(el);

      const angle = (i / CHAOS_ICONS.length) * Math.PI * 2;
      const speed = 0.6 + Math.random() * 0.8;
      return {
        el,
        x: Math.random() * Math.max(0, arena.offsetWidth - ICON_SIZE),
        y: Math.random() * Math.max(0, arena.offsetHeight - ICON_SIZE),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 1.2,
      };
    });

    const onMouseMove = (e: MouseEvent) => {
      const rect = arena.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => { mouseRef.current = { x: -999, y: -999 }; };
    arena.addEventListener('mousemove', onMouseMove);
    arena.addEventListener('mouseleave', onMouseLeave);

    const tick = () => {
      const w = arena.offsetWidth;
      const h = arena.offsetHeight;
      const { x: mx, y: my } = mouseRef.current;

      for (const p of particles) {
        const dx = p.x + ICON_SIZE / 2 - mx;
        const dy = p.y + ICON_SIZE / 2 - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 && dist > 0) {
          const force = ((80 - dist) / 80) * 2.5;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 2.5) { p.vx = (p.vx / spd) * 2.5; p.vy = (p.vy / spd) * 2.5; }

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
        if (p.x > w - ICON_SIZE) { p.x = w - ICON_SIZE; p.vx = -Math.abs(p.vx); }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
        if (p.y > h - ICON_SIZE) { p.y = h - ICON_SIZE; p.vy = -Math.abs(p.vy); }

        p.el.style.transform = `translate(${p.x}px,${p.y}px) rotate(${p.rotation}deg)`;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      arena.removeEventListener('mousemove', onMouseMove);
      arena.removeEventListener('mouseleave', onMouseLeave);
      particles.forEach(p => p.el.remove());
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full max-w-4xl mx-auto">
      {/* Chaos box */}
      <div className="flex-1 w-full border border-white/10 rounded-xl bg-white/[0.02] p-4">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 block mb-3">
          Your knowledge today...
        </span>
        <div ref={arenaRef} className="relative w-full h-[230px] overflow-hidden" aria-hidden="true" />
      </div>

      {/* Arrow */}
      <div className="shrink-0 text-blue-500 rotate-90 md:rotate-0 animate-pulse">
        <ArrowRight className="h-10 w-10" />
      </div>

      {/* Dashboard mockup */}
      <div className="flex-1 w-full border border-white/10 rounded-xl bg-white/[0.02] p-4">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 block mb-3">
          ...with DevStash
        </span>
        <div className="flex gap-2.5 h-[230px]">
          {/* Sidebar */}
          <div className="flex flex-col gap-1.5 w-14 pt-1 shrink-0">
            <div className="h-2.5 rounded bg-blue-500/80 w-4/5" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-2.5 rounded bg-white/10" />
            ))}
          </div>
          {/* Content */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            {/* Top bar */}
            <div className="flex items-center gap-1.5 pb-1.5 border-b border-white/[0.06]">
              <div className="flex-1 h-3.5 rounded bg-white/[0.06] border border-white/[0.08] flex items-center gap-1 px-1.5">
                <div className="w-1.5 h-1.5 rounded-full border border-white/20 shrink-0" />
                <div className="w-2/5 h-0.5 rounded bg-white/10" />
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shrink-0 opacity-80" />
            </div>
            {/* Cards */}
            <div className="grid grid-cols-2 gap-1.5 overflow-hidden">
              {CARDS.map((card, i) => (
                <div
                  key={i}
                  className="rounded-md bg-white/[0.05] p-1.5 flex flex-col gap-1"
                  style={{ borderTop: `3px solid ${card.accent}` }}
                >
                  <div className="h-1 rounded-sm bg-white/25" style={{ width: card.titleW }} />
                  <div className="h-0.5 rounded-sm bg-white/10" style={{ width: card.line1 }} />
                  <div className="h-0.5 rounded-sm bg-white/10" style={{ width: card.line2 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
