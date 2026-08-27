/**
 * Whether this browser can give us a WebGL context at all.
 *
 * Probed on a throwaway canvas, never on the one we intend to render into: a
 * failed `getContext` poisons that canvas for every later attempt.
 */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}
