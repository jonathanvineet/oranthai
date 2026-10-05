import { Suspense, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import { Pencil, PENCIL_RADIUS, setGroupOpacity, type PencilHandle } from "./Pencil";
import { StudioLights } from "./StudioLights";
import { FountainPen } from "./FountainPen";
import { Books, GiftBox, Watch } from "./Props";
import { BooksModel, GiftModel, PenModel, WatchModel, preloadModels } from "./Models";

preloadModels();
import type { Progress } from "../lib/motion";

type Props = {
  progress: Progress;
  /** The HTML band the pencil must land on exactly. */
  bandRef: RefObject<HTMLElement | null>;
  /** The element the pencil floats beside before scrolling. */
  anchorRef: RefObject<HTMLElement | null>;
  mobile: boolean;
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function PencilRig({ progress, bandRef, anchorRef, mobile }: Props) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const pencil = useRef<PencilHandle>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  useFrame((state) => {
    const g = group.current;
    const s = spin.current;
    const band = bandRef.current;
    const anchor = anchorRef.current;
    if (!g || !s || !band || !anchor) return;

    // The View's DOM rect is the hero section; convert DOM pixels to world units on the z=0 plane.
    // Visible plane size at z=0. Uses the live camera aspect (the portal's size is fixed at mount).
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.position.z;
    const vp = { width: vh * camera.aspect, height: vh };
    const hostRect = (band.closest("section") ?? band).getBoundingClientRect();
    const toWorld = (px: number, py: number) =>
      new THREE.Vector2(((px - hostRect.left) / hostRect.width - 0.5) * vp.width, -((py - hostRect.top) / hostRect.height - 0.5) * vp.height);
    const pxToWorld = vp.width / hostRect.width;

    const b = band.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    const bandCentre = toWorld(b.left + b.width / 2, b.top + b.height / 2);
    const anchorCentre = toWorld(a.left + a.width / 2, a.top + a.height / 2);

    const p = ease(THREE.MathUtils.clamp(progress.current, 0, 1));
    const t = state.clock.elapsedTime;

    // Floating state: tilted beside the seal, bobbing and slowly turning.
    // It floats outside the orbit (to the right on desktop, above it on phones) so the circling
    // props never pass through it.
    const sealR = (a.width / 2) * pxToWorld;
    const floatLen = mobile ? 0.5 * vp.width : Math.min(0.22 * vp.width, sealR * 4.2);
    const floatX = anchorCentre.x + (mobile ? 0 : sealR * 3.75);
    const floatY = anchorCentre.y + (mobile ? sealR * 1.9 : sealR * 0.2) + Math.sin(t * 0.9) * 0.08;

    // Landed state: exactly the band's box.
    const landLen = b.width * pxToWorld;
    const landThick = b.height * pxToWorld;

    const len = THREE.MathUtils.lerp(floatLen, landLen, p);
    const thick = THREE.MathUtils.lerp(floatLen * 0.075, landThick, p);
    g.position.set(THREE.MathUtils.lerp(floatX, bandCentre.x, p), THREE.MathUtils.lerp(floatY, bandCentre.y, p), 0);
    // Uniform scale from thickness; the body stretches to reach the requested length.
    const k = thick / (PENCIL_RADIUS * 2);
    g.scale.setScalar(k);
    pencil.current?.setLength(len / k);
    g.rotation.z = THREE.MathUtils.lerp(mobile ? -0.12 : 1.05, 0, p);
    g.rotation.y = THREE.MathUtils.lerp(Math.sin(t * 0.35) * 0.35, 0, p);

    // Roll around its own axis while floating, settle on a flat face when landed.
    const roll = t * 0.45;
    const flat = Math.PI / 6;
    s.rotation.x = THREE.MathUtils.lerp(roll, Math.round(roll / (Math.PI / 3)) * (Math.PI / 3) + flat, p);

    // Hand over to the HTML band at the very end.
    setGroupOpacity(g, 1 - THREE.MathUtils.smoothstep(progress.current, 0.9, 0.99));
  });

  return (
    <group ref={group}>
      <group ref={spin}>
        <Pencil ref={pencil} />
      </group>
    </group>
  );
}

// The still life that circles the seal: what Oranthai sells, in miniature.
const ORBIT = [
  { key: "pen", phase: 0, scale: 0.42, tilt: [0.2, 0, 0.5], rock: false },
  { key: "books", phase: Math.PI / 2, scale: 0.95, tilt: [0.35, 0, 0], rock: false },
  // the watch rocks instead of spinning so its face stays readable
  { key: "watch", phase: Math.PI, scale: 1.0, tilt: [-0.1, 0, 0], rock: true },
  { key: "gift", phase: (Math.PI * 3) / 2, scale: 0.9, tilt: [0.3, 0.4, 0], rock: false },
] as const;

function OrbitRig({ progress, bandRef, anchorRef, mobile }: Props) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const items = useRef<(THREE.Group | null)[]>([]);
  const spins = useRef<(THREE.Group | null)[]>([]);
  const occluder = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const anchor = anchorRef.current;
    const band = bandRef.current;
    if (!anchor || !band) return;
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.position.z;
    const vw = vh * camera.aspect;
    const host = (band.closest("section") ?? band).getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    const cx = ((a.left + a.width / 2 - host.left) / host.width - 0.5) * vw;
    const cy = -((a.top + a.height / 2 - host.top) / host.height - 0.5) * vh;
    const R = (a.width / 2) * (vw / host.width);

    // Invisible disc over the HTML seal (plus its dashed ring, 10px out). It draws no colour but writes
    // depth, so props on the far half of the orbit disappear behind the logo and near ones pass in front.
    // It sits slightly back so the pencil (at z=0) is never clipped; scaled up to cover the same screen area.
    const occ = occluder.current;
    if (occ) {
      const z = -R * 0.2;
      const persp = (camera.position.z - z) / camera.position.z;
      occ.position.set(cx, cy, z);
      occ.scale.setScalar((R + 10 * (vw / host.width)) * persp);
    }

    // As the pencil starts to lie down, the orbit spins outward and fades, clearing the stage.
    const leave = THREE.MathUtils.smoothstep(progress.current, 0, 0.4);
    const spread = 1 + leave * 1.8;
    const t = state.clock.elapsedTime;
    const rx = R * (mobile ? 1.5 : 2.2) * spread;
    // Flatter and lifted slightly, so the near (lower) pass clears the button under the seal.
    const ry = R * (mobile ? 0.75 : 1.05) * spread;

    ORBIT.forEach((o, i) => {
      const g = items.current[i];
      const sp = spins.current[i];
      if (!g || !sp) return;
      const th = o.phase + t * 0.22 + leave * 1.2;
      // Tilted ring seen from slightly above: far side recedes, near side comes forward.
      const depth = -Math.sin(th);
      // The near (lower) half of the ring is squashed so passes cross the seal, never the button below it.
      const sy = Math.sin(th);
      g.position.set(cx + Math.cos(th) * rx, cy + R * 0.1 + sy * ry * (sy < 0 ? 0.4 : 0.92), depth * R * 1.1);
      g.scale.setScalar(R * o.scale * (mobile ? 0.85 : 1) * (0.88 + 0.12 * depth));
      const turn = o.rock ? Math.sin(t * 0.8) * 0.5 : t * 0.55 + i;
      sp.rotation.set(o.tilt[0] + Math.sin(t * 0.7 + i) * 0.12, o.tilt[1] + turn, o.tilt[2]);
      setGroupOpacity(g, 1 - leave);
    });
  });

  const keep = (arr: typeof items, i: number) => (el: THREE.Group | null) => void (arr.current[i] = el);
  return (
    <>
      <mesh ref={occluder} renderOrder={-1}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial colorWrite={false} />
      </mesh>
      {ORBIT.map((o, i) => (
        <group key={o.key} ref={keep(items, i)}>
          <group ref={keep(spins, i)}>
            {/* real models, with the procedural props holding each slot while they stream in */}
            {o.key === "pen" && (
              <Suspense fallback={<FountainPen />}>
                <PenModel />
              </Suspense>
            )}
            {o.key === "books" && (
              <Suspense fallback={<Books />}>
                <BooksModel />
              </Suspense>
            )}
            {o.key === "watch" && (
              <Suspense fallback={<Watch />}>
                <WatchModel />
              </Suspense>
            )}
            {o.key === "gift" && (
              <Suspense fallback={<GiftBox />}>
                <GiftModel />
              </Suspense>
            )}
          </group>
        </group>
      ))}
    </>
  );
}

export default function HeroScene(props: Props) {
  return (
    <View className="pointer-events-none absolute inset-0">
      {/* Own boundary: a scene that is still loading must not blank the shared canvas (and every other scene). */}
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 0, 14]} fov={30} />
        <StudioLights cheap={props.mobile} />
        <PencilRig {...props} />
        <OrbitRig {...props} />
      </Suspense>
    </View>
  );
}
