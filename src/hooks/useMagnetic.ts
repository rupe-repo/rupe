import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { prefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Restrained magnetic pull for primary CTAs: the element leans toward the
 * pointer by at most `strength` px and springs back on leave. Only runs for
 * fine pointers, so touch and keyboard users get plain buttons.
 */
export function useMagnetic<T extends HTMLElement>(strength = 14) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const moveX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const moveY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (event.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (event.clientY - (r.top + r.height / 2)) / (r.height / 2);
      moveX(gsap.utils.clamp(-1, 1, dx) * strength);
      moveY(gsap.utils.clamp(-1, 1, dy) * strength * 0.6);
    };
    const onLeave = () => {
      moveX(0);
      moveY(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength]);

  return ref;
}
