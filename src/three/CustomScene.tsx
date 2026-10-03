import { Suspense, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import { Pencil, setGroupOpacity, type PencilHandle } from "./Pencil";
import { FountainPen, PEN_LENGTH } from "./FountainPen";
import { StudioLights } from "./StudioLights";
import { PenModel } from "./Models";
import { CUSTOM_TIMING } from "../sections/customTiming";
import { span } from "../sections/storesTiming";
import type { Progress } from "../lib/motion";

export type Tip = { x: number; y: number; lift: number };

type Props = {
  progress: Progress;
  /** Screen position of the writing point, updated by the section as each word is revealed. */
  tip: RefObject<Tip>;
  hostRef: RefObject<HTMLElement | null>;
};

// Writing pose: nib down and to the left, barrel rising up-right and toward the viewer.
const POSE = new THREE.Vector3(-0.52, -0.6, 0.6).normalize();

function Writer({ progress, tip, hostRef }: Props) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const pencilRig = useRef<THREE.Group>(null);
  const pencil = useRef<PencilHandle>(null);
  const penRig = useRef<THREE.Group>(null);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), POSE), []);
  const spin = useMemo(() => new THREE.Quaternion(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const host = hostRef.current;
    const t = tip.current;
    const pr = pencilRig.current;
    const pn = penRig.current;
    if (!host || !t || !pr || !pn) return;
    const p = progress.current;
    const rect = host.getBoundingClientRect();
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.position.z;
    const vw = vh * camera.aspect;
    const pxToWorld = vw / rect.width;

    // Nib point on the z=0 plane, lifted slightly between words.
    const nibX = (t.x / rect.width - 0.5) * vw;
    const nibY = -(t.y / rect.height - 0.5) * vh + t.lift * 0.35;
    const worldLen = 210 * pxToWorld;
    const k = worldLen / PEN_LENGTH;

    // Enter from the left, then the pencil spins into the pen.
    const enter = span(p, CUSTOM_TIMING.enter);
    const morph = span(p, CUSTOM_TIMING.morph);
    const offX = THREE.MathUtils.lerp(-vw * 0.65, 0, 1 - Math.pow(1 - enter, 3));
    const turn = Math.sin(morph * Math.PI) * Math.PI * 1.5 + morph * Math.PI * 2;
    spin.setFromAxisAngle(POSE, turn);

    for (const [rig, scaleFor] of [
      [pr, 1 - THREE.MathUtils.smoothstep(morph, 0.35, 0.65)],
      [pn, THREE.MathUtils.smoothstep(morph, 0.35, 0.65)],
    ] as const) {
      const s = k * (0.55 + 0.45 * scaleFor);
      rig.scale.setScalar(s);
      rig.quaternion.copy(spin).multiply(q);
      pos.set(nibX + offX, nibY, 0).addScaledVector(POSE, -(PEN_LENGTH / 2) * s);
      rig.position.copy(pos);
      setGroupOpacity(rig, scaleFor * enter);
    }
  });

  return (
    <>
      <group ref={pencilRig}>
        <Pencil ref={pencil} />
      </group>
      <group ref={penRig}>
        {/* the real pen model writes; the procedural pen holds its place while it loads */}
        <Suspense fallback={<FountainPen />}>
          <PenModel />
        </Suspense>
      </group>
    </>
  );
}

export default function CustomScene(props: Props) {
  return (
    <View className="pointer-events-none absolute inset-0">
      {/* Own boundary: a scene that is still loading must not blank the shared canvas (and every other scene). */}
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 0, 14]} fov={30} />
        <StudioLights />
        <Writer {...props} />
      </Suspense>
    </View>
  );
}
