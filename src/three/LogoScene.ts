import * as THREE from 'three';
import {
  createRupeLogo,
  createRupeOutline,
  LOGO_PROFILES,
  type LogoProfile,
  type RupeLogo,
} from './createRupeLogo';
import type { LogoPose } from './logoChoreography';
import {
  createMarkMaterial,
  createMobileMarkMaterial,
  createStudioEnvironment,
} from './materials';

export interface LogoSceneOptions {
  /** Art direction, not a quality tier — see `SCENE_PROFILES`. */
  profile?: LogoProfile;
  /** Suppresses idle motion and pointer parallax (prefers-reduced-motion). */
  reducedMotion?: boolean;
  /** Fires once, the first time the visitor grabs the mark. */
  onFirstInteraction?: () => void;
  /**
   * Fires if the device cannot hold a usable frame rate even at the lowest
   * pixel ratio. The caller should tear the scene down and show the still.
   */
  onTooSlow?: () => void;
  /** Fires if the GPU drops the context and it does not come back. */
  onContextLost?: () => void;
  /**
   * Element whose on-screen presence gates the frame loop. Defaults to the
   * canvas container — which, being a fixed full-viewport layer, always
   * intersects and therefore never stops the loop.
   *
   * Mobile passes the hero instead: once the hero scrolls away the loop stops
   * and stays stopped, because the mobile journey has no later keyframe that
   * could ask for a redraw. Desktop passes nothing and is unaffected.
   */
  visibilityTarget?: Element;
}

/**
 * Per-profile setup. Mobile is deliberately its own art direction: a narrower
 * lens so a 390px-wide viewport does not stretch the mark, a nearly frontal
 * rest pose so the symbol reads instead of its side walls, and antialiasing
 * back ON — a monoline mark is almost all edge, and MSAA buys more there than
 * extra pixels do.
 */
const SCENE_PROFILES = {
  desktop: {
    fov: 34,
    cameraZ: 3.85,
    rest: { x: 0.085, y: -0.42, z: -0.035 },
    fitPad: 1.06,
    maxDpr: 1.75,
    antialias: true,
    exposure: 1.05,
  },
  mobile: {
    fov: 24,
    cameraZ: 5.2,
    rest: { x: 0.03, y: -0.07, z: 0 },
    // Sized so the peak of the scroll timeline (scale 1.15) still lands inside
    // the frame: 0.5 × baseScale × 1.15 = 98.9% of the visible half-height.
    // At 0.92 the mark clipped by ~6% exactly when it was largest and solid.
    fitPad: 0.86,
    // 1.25, not 2: the canvas is the whole viewport and carries 4x MSAA, so
    // every 0.25 of pixel ratio is real shading cost on a phone. MSAA is what
    // fixes the edges on a monoline mark; extra pixels barely help.
    maxDpr: 1.25,
    antialias: true,
    exposure: 1.0,
  },
} as const satisfies Record<LogoProfile, {
  fov: number; cameraZ: number; rest: { x: number; y: number; z: number };
  fitPad: number; maxDpr: number; antialias: boolean; exposure: number;
}>;


const DEG = Math.PI / 180;

/**
 * What one draw of the mark may cost the main thread, in milliseconds.
 *
 * A frozen scene draws once per scroll event, so this is the number that
 * decides whether a scroll reads as smooth or as a stutter — not frame rate.
 * A phone that can run this scene at all submits the draw in one to three
 * milliseconds; six is already most of a frame's budget spent on a mark that
 * is not even moving.
 */
const DRAW_BUDGET_MS = 6;
/** Draws to ignore at the start: geometry and environment uploads land there. */
const DRAW_WARMUP = 3;


/** Drag tuning. A container width of travel sweeps about three quarters of a turn. */

/**
 * Free trackball rotation. Drag turns the mark a full 360° on both axes with
 * no limit and no gimbal lock — the accumulated rotation is a quaternion, not
 * Euler angles, so pitching past vertical behaves the way a real object does.
 * Desktop only: a finger belongs to the page's scroll.
 */
/**
 * Drag rate is measured against the mark, not the canvas. The canvas is the
 * whole viewport now, so scaling by its width made the same gesture turn the
 * object about a third as far as it used to — dragging across the mark's own
 * width is what should turn it half a rotation, whatever the screen is doing.
 */
const DRAG_TURN_PER_MARK = Math.PI * 0.95;
const UP = new THREE.Vector3(0, 1, 0);
const RIGHT = new THREE.Vector3(1, 0, 0);
const IDENTITY = new THREE.Quaternion();
/** Flick momentum: rad/s decay constant, and the floor where it stops mattering. */
const SPIN_DECAY = 1.4;
const SPIN_FLOOR = 0.012;
/** How long the mark holds the visitor's angle before drifting home. */
const RETURN_DELAY_MS = 2600;
const RETURN_LAMBDA = 0.45;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.damp(current, target, lambda, dt);




/**
 * Owns the WebGL lifecycle for the hero mark: one renderer, one logo, and a
 * frame loop that only runs while the canvas is on screen and the tab is
 * visible. Everything it allocates is released in `dispose()`.
 */
export class LogoScene {
  private readonly container: HTMLElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly logo: RupeLogo;
  private readonly pivot: THREE.Group;
  private env: { texture: THREE.Texture; dispose(): void };
  private readonly lights: THREE.Light[] = [];
  private readonly resizeObserver: ResizeObserver;
  private readonly intersectionObserver: IntersectionObserver;

  private readonly opts: Required<
    Omit<
      LogoSceneOptions,
      'onFirstInteraction' | 'onTooSlow' | 'onContextLost' | 'visibilityTarget'
    >
  > &
    Pick<
      LogoSceneOptions,
      'onFirstInteraction' | 'onTooSlow' | 'onContextLost' | 'visibilityTarget'
    >;
  private readonly cfg: (typeof SCENE_PROFILES)[LogoProfile];
  private readonly mobile: boolean;
  /** Outline the mobile mark dissolves into on its way out of the hero. */
  private outline: THREE.LineSegments | null = null;
  /** Whether this device gets to grab the mark at all. */
  private interactive = false;
  /** Set by the frame loop: the mark is solid and near enough to be grabbed. */
  private grabbable = false;
  private readonly raycaster = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  /** Adaptive pixel ratio — steps down if the device cannot keep up. */
  private dpr = 1;
  private perfSamples = 0;
  private perfAccum = 0;
  private perfStep = 0;
  private drawSamples = 0;
  private drawAccum = 0;
  private drawsSeen = 0;
  private readonly clock = new THREE.Clock();
  private frame = 0;
  private visible = true;
  private running = false;
  private disposed = false;
  private contextLost = false;
  private restoreTimer = 0;

  /** Pointer position in normalised container space, −1…1. */
  private pointer = new THREE.Vector2();
  private pointerTarget = new THREE.Vector2();
  private pointerActive = false;

  /** Where the choreography wants the mark, and where it currently is. */
  private pose: LogoPose = { x: 0, y: 0, scale: 1, rotX: 0, rotY: 0, rotZ: 0, solid: 1, outline: 0 };
  private posed: LogoPose = { ...this.pose };
  /** Base world scale that makes the mark fill its share of the viewport. */
  private baseScale = 1;
  /** Set while anything is still moving; the loop parks when it clears. */
  private dirty = true;

  /** 0 → 1 intro settle, drives the entrance from a wider angle. */
  private intro = 0;

  /** Direct manipulation: yaw/pitch the visitor has added by dragging. */
  /** Rotation the visitor has added, as a quaternion so it never gimbals. */
  private dragQuat = new THREE.Quaternion();
  private dragShown = new THREE.Quaternion();
  /** Flick momentum: an axis and an angular speed in rad/s. */
  private spinAxis = new THREE.Vector3(0, 1, 0);
  private spinSpeed = 0;
  private readonly tmpQuat = new THREE.Quaternion();
  private readonly poseQuat = new THREE.Quaternion();
  private readonly poseEuler = new THREE.Euler();
  private dragging = false;
  private dragPointerId: number | null = null;
  private dragLast = { x: 0, y: 0, t: 0 };
  private releasedAt = 0;
  /** While the pointer is still over the mark the visitor is plainly not done
      with it, so the drift home waits. */
  private hovering = false;
  /** Parallax fades out while a drag owns the mark, and back in afterwards. */
  private parallaxWeight = 1;
  private interacted = false;
  private warmTimer = 0;
  /**
   * The mark holds one pose and only redraws when the choreography moves it.
   *
   * True on every phone, and on any device asking for reduced motion. There is
   * no idle drift, no breathing, no easing toward the target and no frame loop
   * between scroll events — a scroll publishes a pose, the scene draws it once
   * and parks.
   */
  private readonly frozen: boolean;

  constructor(container: HTMLElement, options: LogoSceneOptions = {}) {
    this.container = container;
    this.opts = { profile: 'desktop', reducedMotion: false, ...options };
    this.cfg = SCENE_PROFILES[this.opts.profile];
    this.mobile = this.opts.profile === 'mobile';
    this.frozen = this.mobile || this.opts.reducedMotion;
    // The intro is an entrance, and a still mark has no entrance to play. It
    // has to be *finished*, not skipped: `applyPose` reads it for a -6% scale
    // and a 0.8-unit push back, so a frozen scene left at 0 would sit small
    // and set back for good.
    if (this.frozen) this.intro = 1;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.cfg.maxDpr);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      // A monoline mark is almost entirely edge. MSAA is what fixes the
      // staircase on it — turning this off was the whole mobile problem.
      antialias: this.cfg.antialias,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    this.renderer.setClearAlpha(0);
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = this.cfg.exposure;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.renderer.domElement.classList.add('rupestage__canvas');
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.cfg.fov, 1, 0.1, 40);
    this.camera.position.set(0, 0, this.cfg.cameraZ);

    this.env = createStudioEnvironment(this.renderer, this.opts.profile);
    this.scene.environment = this.env.texture;

    const geo = LOGO_PROFILES[this.opts.profile];
    this.logo = createRupeLogo({
      ...geo,
      material: {},
    });
    // Swap in the profile's finish. Mobile drops clearcoat/iridescence/sheen,
    // which read as speckle on thin strokes at small sizes.
    const finish = this.mobile ? createMobileMarkMaterial() : createMarkMaterial();
    this.logo.frame.material = finish;
    this.logo.accent.material = finish;
    this.logo.material.dispose();
    (this.logo as { material: THREE.MeshPhysicalMaterial }).material = finish;

    this.outline = createRupeOutline();
    this.logo.add(this.outline);

    this.pivot = new THREE.Group();
    this.pivot.add(this.logo);
    this.scene.add(this.pivot);

    this.addLights();
    this.resize();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);

    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        this.visible ? this.start() : this.stop();
      },
      { rootMargin: '120px' },
    );
    this.intersectionObserver.observe(this.opts.visibilityTarget ?? container);

    // Touch drags the page, not the mark. Only a real pointer gets the object.
    this.interactive =
      !this.mobile && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (this.interactive) {
      window.addEventListener('pointerdown', this.onPointerDown);
      window.addEventListener('pointermove', this.onPointerMove);
      window.addEventListener('pointerup', this.onPointerUp);
      window.addEventListener('pointercancel', this.onPointerUp);
    }

    // A dropped GPU context leaves a frozen canvas. Stop the loop, let the
    // browser hand it back, and rebuild what the restore does not restore.
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestored);

    document.addEventListener('visibilitychange', this.onVisibility);
    this.warmUp();
  }

  /**
   * Link the program before the first frame needs it.
   *
   * MeshPhysicalMaterial with clearcoat is the most expensive shader three
   * compiles, and a mid-range phone spends a few hundred milliseconds on it.
   * Inside `render()` that is a blocked main thread during the visitor's first
   * scroll; through `compileAsync` the driver links it on its own thread
   * (KHR_parallel_shader_compile) and the page keeps moving.
   *
   * The loop starts either way — on resolve, on rejection, or on the timeout —
   * so a driver without the extension only ever costs the frame it costs now.
   */
  private warmUp() {
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      window.clearTimeout(this.warmTimer);
      this.start();
    };

    // A compile that never settles must not leave the mark invisible forever.
    this.warmTimer = window.setTimeout(go, 1200);
    this.renderer.compileAsync(this.scene, this.camera).then(go, go);
  }

  // -- setup ---------------------------------------------------------------

  private addLights() {
    // Point lights (not directional) so their falloff paints a real tonal
    // gradient across the flat front face — the reference render's main tell.
    const ambient = new THREE.AmbientLight(0x8f77c6, 0.13);

    const key = new THREE.PointLight(0xfff6ff, 34, 0, 2);
    key.position.set(-1.7, 1.85, 2.3);

    this.lights.push(ambient, key);

    if (this.mobile) {
      // Three lights, no rim: a rim on a shallow extrusion only lights the
      // side walls, which is exactly what mobile is trying not to show.
      const fill = new THREE.PointLight(0xc9a6ff, 9, 0, 2);
      fill.position.set(1.9, -0.6, 2.6);
      this.lights.push(fill);
      this.scene.add(...this.lights);
      return;
    }

    {
      const warm = new THREE.PointLight(0xb583ff, 15, 0, 2);
      warm.position.set(2.3, -0.9, 1.5);

      const rim = new THREE.DirectionalLight(0x8e4dff, 1.35);
      rim.position.set(3.1, -1.4, -2.2);

      this.lights.push(warm, rim);
    }

    this.scene.add(...this.lights);
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (!w || !h) return;

    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h, false);

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    // Fit the mark's bounding sphere into the shorter viewport axis.
    const fovRad = THREE.MathUtils.degToRad(this.camera.fov);
    const visibleH = 2 * Math.tan(fovRad / 2) * this.camera.position.z;
    const visibleW = visibleH * this.camera.aspect;
    // What `scale: 1` means, per profile.
    //   mobile  — 72% of the viewport width, so a keyframe's number reads
    //             directly as screen size and the 0.5–1.5 clamp is meaningful.
    //   desktop — 55% of the shorter side, which is the framing it was built on.
    this.baseScale = this.mobile
      ? visibleW * 0.72
      : Math.min(visibleH, visibleW) * 0.55;
    this.dirty = true;

    this.render();
  }

  // -- external control ----------------------------------------------------

  /** The choreography's target for this frame. */
  setPose(next: LogoPose) {
    const p = this.pose;
    if (
      p.x === next.x && p.y === next.y && p.scale === next.scale &&
      p.rotX === next.rotX && p.rotY === next.rotY && p.rotZ === next.rotZ &&
      p.solid === next.solid && p.outline === next.outline
    ) {
      return;
    }
    Object.assign(this.pose, next);
    this.dirty = true;
    // Waking the loop to animate toward an invisible pose is pure cost; only
    // do it if something is, or is about to be, on screen.
    const nothingToShow =
      next.solid <= 0.004 && next.outline <= 0.004 &&
      this.posed.solid <= 0.004 && this.posed.outline <= 0.004;
    if (nothingToShow) {
      this.logo.visible = false;
      return;
    }
    this.start();
  }

  /** Pointer in normalised container space (−1…1). Call with `null` on leave. */
  setPointer(x: number | null, y = 0) {
    if (this.dragging) return;
    if (x === null) {
      this.pointerActive = false;
      this.pointerTarget.set(0, 0);
      return;
    }
    this.pointerActive = true;
    this.pointerTarget.set(clamp(x, -1, 1), clamp(y, -1, 1));
  }

  /**
   * Keyboard nudge, in the same units a drag produces. Used by the arrow-key
   * handler so the mark is operable without a pointer.
   */
  nudgeRotation(yaw: number, pitch: number) {
    this.markInteracted();
    this.turn(yaw, pitch);
    this.spinSpeed = 0;
    this.releasedAt = performance.now();
    this.start();
  }

  /** Returns the mark to its rest pose, by the short way round. */
  resetRotation() {
    this.dragQuat.identity();
    this.spinSpeed = 0;
    this.releasedAt = 0;
    this.start();
  }

  // -- direct manipulation -------------------------------------------------

  /** True when the pointer is actually over the mark, not just over the page. */
  private overMark(event: PointerEvent): boolean {
    if (!this.grabbable) return false;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.ndc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ndc, this.camera);
    return this.raycaster.intersectObjects([this.logo.frame, this.logo.accent], false).length > 0;
  }

  /** Screen-relative turn: yaw about the world up, pitch about screen right. */
  private turn(yaw: number, pitch: number) {
    this.tmpQuat.setFromAxisAngle(UP, yaw);
    this.dragQuat.premultiply(this.tmpQuat);
    this.tmpQuat.setFromAxisAngle(RIGHT, pitch);
    this.dragQuat.premultiply(this.tmpQuat);
  }

  private markInteracted() {
    if (this.interacted) return;
    this.interacted = true;
    this.opts.onFirstInteraction?.();
  }

  private onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // Only a press that actually lands on the mark starts a drag; everything
    // else belongs to the page underneath.
    if (!this.overMark(event)) return;
    this.dragging = true;
    this.dragPointerId = event.pointerId;
    this.dragLast = { x: event.clientX, y: event.clientY, t: event.timeStamp };
    this.spinSpeed = 0;
    this.markInteracted();

    document.body.style.cursor = 'grabbing';

    // Reduced motion parks the loop; a drag is visitor-driven, so wake it.
    this.start();
  };

  private onPointerMove = (event: PointerEvent) => {
    if (!this.dragging || event.pointerId !== this.dragPointerId) {
      // Not dragging: just advertise grabbability where the mark actually is.
      if (!this.dragging && event.pointerType === 'mouse') {
        const over = this.overMark(event);
        this.hovering = over;
        document.body.style.cursor = over ? 'grab' : '';
      }
      return;
    }

    const markPx = this.markPixelSize();
    if (!markPx) return;

    const dx = event.clientX - this.dragLast.x;
    const dy = event.clientY - this.dragLast.y;
    const dt = Math.max((event.timeStamp - this.dragLast.t) / 1000, 1 / 240);
    this.dragLast = { x: event.clientX, y: event.clientY, t: event.timeStamp };

    // Both deltas use the same scale so the object turns at the same rate
    // whichever way it is pushed — a trackball, not two separate dials.
    const k = DRAG_TURN_PER_MARK / markPx;
    this.turn(dx * k, dy * k);

    // Momentum: the axis the last move rotated around, and how fast.
    const mag = Math.hypot(dx, dy) * k;
    if (mag > 1e-5) {
      this.spinAxis.set(dy, dx, 0).normalize();
      this.spinSpeed = THREE.MathUtils.lerp(this.spinSpeed, mag / dt, 0.45);
    }

    if (!this.running) this.render();
  };

  private onPointerUp = (event: PointerEvent) => {
    if (!this.dragging || event.pointerId !== this.dragPointerId) return;
    this.dragging = false;
    this.dragPointerId = null;
    this.releasedAt = performance.now();

    document.body.style.cursor = '';

    // A stale sample from a long pause before release must not launch a spin.
    if (event.timeStamp - this.dragLast.t > 90) this.spinSpeed = 0;
    if (this.frozen) this.spinSpeed = 0;
    this.spinSpeed = clamp(this.spinSpeed, 0, 9);
  };

  get group(): THREE.Group {
    return this.logo;
  }

  // -- loop ----------------------------------------------------------------

  private start() {
    if (this.running || this.disposed || this.contextLost) return;
    if (document.hidden || !this.visible) return;
    this.running = true;
    this.clock.getDelta();
    this.frame = requestAnimationFrame(this.tick);
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  private onContextLost = (event: Event) => {
    // Preventing the default is what makes the browser attempt a restore.
    event.preventDefault();
    this.contextLost = true;
    this.stop();
    // If nothing comes back, the caller falls through to the static mark.
    this.restoreTimer = window.setTimeout(() => {
      if (this.contextLost) this.opts.onContextLost?.();
    }, 3000);
  };

  private onContextRestored = () => {
    this.contextLost = false;
    window.clearTimeout(this.restoreTimer);
    // The environment map lives in a render target the lost context took with
    // it; everything else three.js re-uploads on the next draw.
    this.env.dispose();
    this.env = createStudioEnvironment(this.renderer, this.opts.profile);
    this.scene.environment = this.env.texture;
    this.dirty = true;
    this.resize();
    // Every program went with the context too, so this is a cold start: link
    // through the same off-thread path the first boot uses.
    this.warmUp();
  };

  private onVisibility = () => {
    document.hidden ? this.stop() : this.start();
  };

  private tick = () => {
    if (!this.running) return;

    // Still: hold the pose the choreography asked for, render once, and park.
    // The mark still travels the page, it just does not ease there.
    if (this.frozen && !this.dragging) {
      this.dragShown.copy(this.dragQuat);
      Object.assign(this.posed, this.pose);
      if (this.applyPose()) {
        const started = performance.now();
        this.render();
        this.sampleDrawCost(performance.now() - started);
      }
      this.stop();
      return;
    }

    this.frame = requestAnimationFrame(this.tick);

    const dt = Math.min(this.clock.getDelta(), 1 / 20);
    const t = this.clock.elapsedTime;

    this.intro = damp(this.intro, 1, 1.6, dt);

    // Ease toward the choreography's target. The scroll position is the
    // authority; this only smooths the last few pixels of it.
    const k = 9;
    const before = this.posed.scale;
    this.posed.x = damp(this.posed.x, this.pose.x, k, dt);
    this.posed.y = damp(this.posed.y, this.pose.y, k, dt);
    this.posed.scale = damp(this.posed.scale, this.pose.scale, k, dt);
    this.posed.rotX = damp(this.posed.rotX, this.pose.rotX, k, dt);
    this.posed.rotY = damp(this.posed.rotY, this.pose.rotY, k, dt);
    this.posed.rotZ = damp(this.posed.rotZ, this.pose.rotZ, k, dt);
    this.posed.solid = damp(this.posed.solid, this.pose.solid, k, dt);
    this.posed.outline = damp(this.posed.outline, this.pose.outline, k, dt);

    // Drag and pointer only belong to the mark while it is still the hero
    // object. Once the journey grows it past that, they fade out of the way.
    const hero = clamp(1 - (this.posed.scale - 1.1) / 0.6, 0, 1);
    this.pointer.x = damp(this.pointer.x, this.pointerTarget.x, 3.4, dt);
    this.pointer.y = damp(this.pointer.y, this.pointerTarget.y, 3.4, dt);
    // Momentum keeps turning the mark after release, on the axis it was flicked.
    if (!this.dragging && this.spinSpeed > SPIN_FLOOR) {
      this.tmpQuat.setFromAxisAngle(this.spinAxis, this.spinSpeed * dt);
      this.dragQuat.premultiply(this.tmpQuat);
      this.spinSpeed *= Math.exp(-SPIN_DECAY * dt);
    } else if (!this.dragging) {
      this.spinSpeed = 0;
      // Once it has been left alone, it drifts back to the pose the
      // choreography wants — the shortest way round, not by unwinding.
      if (!this.hovering && performance.now() - this.releasedAt > RETURN_DELAY_MS) {
        this.dragQuat.slerp(IDENTITY, 1 - Math.exp(-RETURN_LAMBDA * dt));
      }
    }

    // Drag only owns the mark while it is still the hero object; past that the
    // journey takes over and the visitor's angle eases out of the way.
    this.tmpQuat.copy(IDENTITY).slerp(this.dragQuat, hero);
    this.dragShown.slerp(this.tmpQuat, 1 - Math.exp(-26 * dt));

    this.parallaxWeight = damp(this.parallaxWeight, this.dragging ? 0 : 1, this.dragging ? 14 : 2.2, dt);

    // The canvas only takes the pointer while the mark is grabbable, so the
    // page underneath stays clickable everywhere else.
    this.grabbable = this.interactive && hero > 0.35 && this.posed.solid > 0.5;

    // Breathing — only while the mark is still parked in the hero and the
    // visitor has not started scrolling. It is a sign of life, not an idle spin.
    const still = this.opts.reducedMotion;
    const breathing = hero * (1 - clamp(Math.abs(this.pose.y - this.posed.y) * 4, 0, 1));
    // Mobile keeps the sign of life down to ~2.5px and a third of a degree:
    // enough to read as alive, small enough that a dropped frame is invisible.
    const ampY = this.mobile ? 2.5 : 3;
    const ampZ = this.mobile ? 0.3 : 0.5;
    const breathY = still ? 0 : Math.sin(t * 0.5) * ampY * breathing;
    const breathZ = still ? 0 : Math.sin(t * 0.37 + 1.2) * ampZ * breathing;

    const par = (this.pointerActive ? 1 : 0.35) * this.parallaxWeight * hero;
    const drew = this.applyPose(breathY, breathZ, this.pointer.x * par, this.pointer.y * par);

    // Nothing visible now and nothing asked for: park. Scrolling through the
    // stretches where the mark is off costs no GPU work at all.
    const wantsNothing = this.pose.solid <= 0.004 && this.pose.outline <= 0.004;
    if (!drew && wantsNothing) {
      this.dirty = false;
      this.stop();
      return;
    }

    // Park once everything has settled — no idle render loop.
    const moving =
      Math.abs(this.posed.scale - this.pose.scale) > 1e-4 ||
      Math.abs(this.posed.x - this.pose.x) > 1e-3 ||
      Math.abs(this.posed.y - this.pose.y) > 1e-3 ||
      Math.abs(this.posed.rotZ - this.pose.rotZ) > 1e-3 ||
      Math.abs(this.posed.solid - this.pose.solid) > 1e-4 ||
      Math.abs(this.posed.outline - this.pose.outline) > 1e-4 ||
      this.dragging || this.spinSpeed > 0 ||
      this.dragShown.angleTo(this.tmpQuat) > 1e-3 ||
      Math.abs(this.pointer.x - this.pointerTarget.x) > 1e-3 ||
      breathing > 0.02 ||
      this.intro < 0.999;
    void before;

    this.samplePerf(dt);
    if (drew) this.render();

    if (!moving && !this.dirty) {
      this.stop();
      return;
    }
    this.dirty = false;
  };

  /**
   * Writes the current pose onto the scene graph.
   * Returns false when there is nothing on screen, so the caller can skip the
   * draw entirely instead of clearing and re-rendering a viewport-sized buffer
   * for an invisible object.
   */
  private applyPose(breathY = 0, breathZ = 0, px = 0, py = 0): boolean {
    const perPx = this.worldPerPixel();
    const vw = this.container.clientWidth || 1;
    const vh = this.container.clientHeight || 1;
    const p = this.posed;

    // Mobile transform envelope. The choreography is authored inside these
    // bounds; this is the guarantee, so no keyframe edit or mid-transition
    // interpolation can put the mark somewhere it swallows the page.
    const scale = this.mobile ? clamp(p.scale, 0.5, 1.5) : p.scale;
    const rotX = this.mobile ? clamp(p.rotX, -8, 8) : p.rotX;
    const rotY = this.mobile ? clamp(p.rotY, -10, 10) : p.rotY;
    const rotZ = this.mobile ? clamp(p.rotZ, -15, 15) : p.rotZ;

    // Fully transparent means fully off — no draw, and nothing that could show
    // through because of a stale material flag.
    const showing = p.solid > 0.004 || p.outline > 0.004;
    this.logo.visible = showing;
    if (!showing) return false;

    this.logo.scale.setScalar(this.baseScale * scale * (1 + (1 - this.intro) * -0.06));
    this.pivot.position.x = (p.x / 100) * vw * perPx + px * 0.09;
    this.pivot.position.y = -(p.y / 100) * vh * perPx + breathY * perPx + py * -0.06;
    this.pivot.position.z = (1 - this.intro) * -0.8;

    this.poseEuler.set(
      rotX * DEG - py * 0.22,
      rotY * DEG + px * 0.34,
      (rotZ + breathZ) * DEG + px * 0.05,
    );
    this.poseQuat.setFromEuler(this.poseEuler);
    // Drag is applied in world space, so it reads as turning the object in
    // front of you rather than as offsets on its own axes.
    this.logo.quaternion.copy(this.poseQuat).premultiply(this.dragShown);

    // Solid ↔ outline crossfade. Two materials, no shader: the plate fades out
    // as the drawing of it fades in.
    const mat = this.logo.material;
    const solid = clamp(p.solid, 0, 1);
    const wantsBlend = solid < 0.999;
    // Toggling `transparent` swaps the shader's blending path, which only takes
    // effect on a recompile. Without this the plate stays opaque no matter what
    // opacity says — flag it on the change, never every frame.
    if (mat.transparent !== wantsBlend) {
      mat.transparent = wantsBlend;
      mat.needsUpdate = true;
    }
    mat.opacity = solid;
    mat.depthWrite = solid > 0.5;
    this.logo.frame.visible = solid > 0.004;
    this.logo.accent.visible = solid > 0.004;

    if (this.outline) {
      const line = clamp(p.outline, 0, 1);
      this.outline.visible = line > 0.004;
      (this.outline.material as THREE.LineBasicMaterial).opacity = line;
    }
    return true;
  }

  /** How tall the mark currently stands on screen, in CSS pixels. */
  private markPixelSize(): number {
    const perPx = this.worldPerPixel();
    if (!perPx) return 0;
    return (this.baseScale * Math.max(this.posed.scale, 0.05)) / perPx;
  }

  /** Visible world units per CSS pixel at the mark's depth. */
  private worldPerPixel(): number {
    const h = this.container.clientHeight || 1;
    const fovRad = THREE.MathUtils.degToRad(this.camera.fov);
    return (2 * Math.tan(fovRad / 2) * this.camera.position.z) / h;
  }

  /**
   * The same adaptive ladder as `samplePerf`, for a scene that parks.
   *
   * `samplePerf` measures frame rate, which is meaningless here: a frozen
   * scene draws once per scroll event and sleeps in between, so it can never
   * "fall behind". What can still ruin a scroll is a single draw that takes
   * too long, so that is what this measures — and it steps the pixel ratio
   * down, then hands over to the still, exactly as the frame-rate path does.
   *
   * One honest limit: `performance.now()` around `render()` measures the CPU
   * cost of submitting the draw, not the GPU's cost of executing it. A driver
   * that queues the work and returns looks fast here. It catches the common
   * mobile failure — a fill-rate-bound draw back-pressuring into the call —
   * and it will not catch every slow device.
   */
  private sampleDrawCost(ms: number) {
    // Phones only. A desktop asking for reduced motion is frozen too, but its
    // canvas is the whole viewport at DPR 1.75 — a completely different budget
    // — and retiring the desktop mark is not this change's business.
    if (!this.mobile || !this.frozen || this.perfStep > 2) return;

    this.drawsSeen += 1;
    if (this.drawsSeen <= DRAW_WARMUP) return;

    this.drawAccum += ms;
    this.drawSamples += 1;
    if (this.drawSamples < 12) return;

    const avg = this.drawAccum / this.drawSamples;
    this.drawAccum = 0;
    this.drawSamples = 0;

    if (avg <= DRAW_BUDGET_MS) {
      this.perfStep = 3; // comfortably fast — stop measuring
      return;
    }

    this.perfStep += 1;

    // Mobile starts at 1.25, so there is exactly one step to give — and never
    // below 1, which is where the frame-rate ladder stops too. Past that the
    // only lever left is not drawing at all.
    if (this.dpr > 1) {
      this.dpr = 1;
      this.resize();
      return;
    }

    // Handing the visitor the still is a one-way door, so it takes more than a
    // single slow batch. A device already at DPR 1 has no step to give, and
    // without this guard one unlucky reading would retire the canvas outright.
    if (this.perfStep > 2) this.opts.onTooSlow?.();
  }

  /**
   * Adaptive pixel ratio. Antialiasing at DPR 2 is the right default on a
   * modern phone and far too much on an old one, so the ratio steps down when
   * frames run long — and the scene bows out entirely if even the floor is too
   * slow, so the caller can show the still instead of a stuttering canvas.
   */
  private samplePerf(dt: number) {
    // A frozen scene never reaches here — the still branch returns above it —
    // and that is right: there is no frame rate to measure when the mark draws
    // once per scroll event rather than continuously.
    if (this.frozen || this.perfStep > 2) return;
    // Ignore the first second: shader compiles and texture uploads land there.
    if (this.clock.elapsedTime < 1) return;

    this.perfAccum += dt;
    this.perfSamples += 1;
    if (this.perfSamples < 45) return;

    const avg = this.perfAccum / this.perfSamples;
    this.perfAccum = 0;
    this.perfSamples = 0;

    if (avg <= 1 / 40) {
      this.perfStep = 3; // comfortably fast — stop measuring
      return;
    }

    this.perfStep += 1;
    const floor = [1.5, 1.25, 1][Math.min(this.perfStep - 1, 2)];
    if (this.dpr > floor) {
      this.dpr = floor;
      this.resize();
      return;
    }
    if (this.perfStep > 2) this.opts.onTooSlow?.();
  }

  private render() {
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);
  }

  // -- teardown ------------------------------------------------------------

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();

    window.clearTimeout(this.restoreTimer);
    window.clearTimeout(this.warmTimer);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.onContextRestored);
    window.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    document.body.style.cursor = '';

    document.removeEventListener('visibilitychange', this.onVisibility);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();

    this.scene.remove(this.pivot);
    for (const light of this.lights) {
      light.dispose?.();
      this.scene.remove(light);
    }
    if (this.outline) {
      this.outline.geometry.dispose();
      (this.outline.material as THREE.Material).dispose();
    }
    this.logo.dispose();
    this.scene.environment = null;
    this.env.dispose();

    this.renderer.domElement.remove();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
