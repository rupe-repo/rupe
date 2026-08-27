import * as THREE from 'three';

export interface MarkMaterialParams {
  color?: THREE.ColorRepresentation;
  sheenColor?: THREE.ColorRepresentation;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  envMapIntensity?: number;
  iridescence?: number;
}

/**
 * Polished violet resin: deep body colour, a clearcoat for the wet highlight
 * along the bevel, and a whisper of iridescence so the rim picks up lilac
 * without tipping into metal or neon.
 */
export function createMarkMaterial(params: MarkMaterialParams = {}): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(params.color ?? '#6d44ad'),
    roughness: params.roughness ?? 0.13,
    metalness: params.metalness ?? 0.06,
    clearcoat: params.clearcoat ?? 1,
    clearcoatRoughness: params.clearcoatRoughness ?? 0.03,
    envMapIntensity: params.envMapIntensity ?? 1.22,
    iridescence: params.iridescence ?? 0.07,
    iridescenceIOR: 1.32,
    iridescenceThicknessRange: [120, 420],
    sheen: 0.2,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(params.sheenColor ?? '#a37cf0'),
    reflectivity: 0.62,
    flatShading: false,
  });
}

/**
 * Simpler finish for small screens. Same violet, same depth cue, but without
 * the clearcoat/iridescence/sheen stack — at 390px those read as speckle on
 * the thin strokes rather than as gloss, and each one costs a shader branch.
 */
export function createMobileMarkMaterial(
  params: MarkMaterialParams = {},
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(params.color ?? '#6b41ae'),
    roughness: params.roughness ?? 0.3,
    metalness: params.metalness ?? 0.02,
    clearcoat: params.clearcoat ?? 0.35,
    clearcoatRoughness: params.clearcoatRoughness ?? 0.3,
    envMapIntensity: params.envMapIntensity ?? 0.85,
    iridescence: 0,
    sheen: 0,
    reflectivity: 0.4,
    flatShading: false,
  });
}

/**
 * A studio in a 512×256 canvas: cool white ceiling, two softbox strips that
 * read as the long specular streaks on the bevels, a violet floor bounce.
 * Cheaper than loading an HDRI and it keeps the palette on-brand.
 */
function studioEquirect(scale = 1): THREE.Texture {
  const w = Math.round(512 * scale);
  const h = Math.round(256 * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#ffffff');
  sky.addColorStop(0.2, '#f6f2ff');
  sky.addColorStop(0.42, '#8f79c4');
  sky.addColorStop(0.58, '#3d2270');
  sky.addColorStop(0.78, '#1d1040');
  sky.addColorStop(1, '#07030f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Crisp horizon strip — the narrow white line that runs along the bevels.
  const strip = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.47);
  strip.addColorStop(0, 'rgba(255,255,255,0)');
  strip.addColorStop(0.5, 'rgba(255,255,255,0.95)');
  strip.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = strip;
  ctx.fillRect(0, h * 0.3, w * 0.62, h * 0.17);

  const softbox = (cx: number, cy: number, rx: number, ry: number, alpha: number) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    g.addColorStop(0, `rgba(255,255,255,${alpha})`);
    g.addColorStop(0.45, `rgba(255,250,255,${alpha * 0.5})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
    ctx.translate(-cx, -cy);
    ctx.fillStyle = g;
    ctx.fillRect(cx - rx * 1.6, cy - ry * 1.6, rx * 3.2, ry * 3.2);
    ctx.restore();
  };

  // key strip, upper left of the mark
  softbox(w * 0.22, h * 0.17, 130, 34, 1);
  // fill strip, upper right
  softbox(w * 0.7, h * 0.24, 96, 26, 0.55);
  // violet bounce from below
  const bounce = ctx.createRadialGradient(w * 0.5, h * 0.9, 0, w * 0.5, h * 0.9, 170);
  bounce.addColorStop(0, 'rgba(140,80,255,0.4)');
  bounce.addColorStop(1, 'rgba(151,96,255,0)');
  ctx.fillStyle = bounce;
  ctx.fillRect(0, h * 0.5, w, h * 0.5);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** Prefilters the studio panorama into a PMREM cube the physical material can sample. */
export function createStudioEnvironment(
  renderer: THREE.WebGLRenderer,
  profile: 'desktop' | 'mobile' = 'desktop',
): {
  texture: THREE.Texture;
  dispose(): void;
} {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  // Mobile prefilters from a half-size panorama: its material samples at higher
  // roughness anyway, so the extra detail never surfaces.
  const source = studioEquirect(profile === 'mobile' ? 0.5 : 1);
  const target = pmrem.fromEquirectangular(source);
  source.dispose();
  pmrem.dispose();
  return {
    texture: target.texture,
    dispose: () => target.dispose(),
  };
}
