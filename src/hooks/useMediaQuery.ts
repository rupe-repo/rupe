import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tabletDown: '(max-width: 1023px)',
  laptopDown: '(max-width: 1439px)',
  desktop: '(min-width: 1440px)',
  finePointer: '(hover: hover) and (pointer: fine)',
} as const;

export const useIsMobile = () => useMediaQuery(BREAKPOINTS.mobile);
export const useIsTabletDown = () => useMediaQuery(BREAKPOINTS.tabletDown);
export const useHasFinePointer = () => useMediaQuery(BREAKPOINTS.finePointer);
