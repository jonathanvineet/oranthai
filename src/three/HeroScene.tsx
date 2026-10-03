import { useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import { Pencil, PENCIL_RADIUS, setGroupOpacity, type PencilHandle } from "./Pencil";
import { StudioLights } from "./StudioLights";
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
    const floatLen = (mobile ? 0.62 : 0.4) * vp.width;
    const floatX = anchorCentre.x + (mobile ? 0 : a.width * 0.95 * pxToWorld);
    const floatY = anchorCentre.y + (mobile ? a.height * 0.62 * pxToWorld : 0) + Math.sin(t * 0.9) * 0.08;

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
    g.rotation.z = THREE.MathUtils.lerp(mobile ? -0.32 : 0.42, 0, p);
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

export default function HeroScene(props: Props) {
  return (
    <View className="pointer-events-none absolute inset-0">
      <PerspectiveCamera makeDefault position={[0, 0, 14]} fov={30} />
      <StudioLights cheap={props.mobile} />
      <PencilRig {...props} />
    </View>
  );
}
