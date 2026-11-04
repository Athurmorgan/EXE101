import { useSyncExternalStore } from 'react';

let ready = false;
const listeners = new Set<() => void>();

/** Called once by the preloader when it lifts; intro animations wait for it. */
export function markPageReady() {
  if (ready) return;
  ready = true;
  document.documentElement.dataset.ready = '';
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** True once the landing preloader has gone, so the hero can play its entrance. */
export function usePageReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => false,
  );
}
