import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import { products } from "../data/site";
import { StudioLights } from "./StudioLights";
import { ringAngle } from "../sections/productsTiming";
import type { Progress } from "../lib/motion";

const N = products.length;
const R = 3.0;
const SLOT = (Math.PI * 2) / N;

function Ring({ progress }: { progress: Progress }) {
  const textures = useLoader(
    THREE.TextureLoader,
    products.map((p) => `/img/products/${p.id}-480.webp`),
  );
  textures.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
  });
  const ring = useRef<THREE.Group>(null);
  const frames = useRef<(THREE.Group | null)[]>([]);
  const photoMats = useMemo(() => textures.map((map) => new THREE.MeshBasicMaterial({ map, toneMapped: false })), [textures]);
  const mats = useMemo(
    () => ({
      white: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 }),
      sky: new THREE.MeshStandardMaterial({ color: "#9bc4ef", roughness: 0.5, side: THREE.DoubleSide }),
      accent: new THREE.MeshStandardMaterial({ color: "#1e63c6", roughness: 0.4 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      photoMats.forEach((m) => m.dispose());
      Object.values(mats).forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
    [photoMats, mats, textures],
  );

  const white = useMemo(() => new THREE.Color("#ffffff"), []);
  const dim = useMemo(() => new THREE.Color("#9fb4cc"), []);

  useFrame((state) => {
    const g = ring.current;
    if (!g) return;
    const a = ringAngle(progress.current);
    g.rotation.y = -a * ((Math.PI * 2) / N);
    g.rotation.x = 0.12 + Math.sin(state.clock.elapsedTime * 0.5) * 0.015;
    frames.current.forEach((f, i) => {
      if (!f) return;
      // Distance (in slots) from the front of the ring; the active frame grows and brightens.
      let d = Math.abs(((i - a) % N + N) % N);
      d = Math.min(d, N - d);
      const focus = Math.max(0, 1 - d);
      f.scale.setScalar(0.66 + 0.5 * focus);
      // Turn each frame partly toward the camera so neighbours read as circles, not slivers,
      // and drop the far side of the ring entirely.
      const world = THREE.MathUtils.euclideanModulo((i - a) * ((Math.PI * 2) / N) + Math.PI, Math.PI * 2) - Math.PI;
      f.rotation.y = -world * 0.7;
      // Only the active frame and its neighbours are shown; frames shrink away as they leave.
      const edge = THREE.MathUtils.smoothstep(Math.abs(world), SLOT * 1.15, SLOT * 1.6);
      f.visible = edge < 0.999;
      f.scale.multiplyScalar(1 - edge);
      photoMats[i].color.copy(dim).lerp(white, Math.max(0.35, focus));
    });
  });

  return (
    <group ref={ring} position={[0, -0.1, -R * 0.62]}>
      {products.map((p, i) => {
        const theta = (i / N) * Math.PI * 2;
        return (
          <group key={p.id} position={[Math.sin(theta) * R, 0, Math.cos(theta) * R]} rotation={[0, theta, 0]}>
            <group ref={(el) => void (frames.current[i] = el)}>
              <mesh material={mats.sky} position={[0, 0, -0.03]}>
                <circleGeometry args={[1.12, 64]} />
              </mesh>
              <mesh material={mats.white} position={[0, 0, -0.01]}>
                <circleGeometry args={[1.06, 64]} />
              </mesh>
              <mesh material={photoMats[i]}>
                <circleGeometry args={[0.97, 64]} />
              </mesh>
              <mesh material={mats.accent} position={[0, 0, 0.005]}>
                <ringGeometry args={[0.97, 1.0, 64]} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}

export default function ProductRing({ progress }: { progress: Progress }) {
  return (
    <View className="pointer-events-none absolute inset-0">
      <PerspectiveCamera makeDefault position={[0, 0.35, 9]} fov={36} />
      <StudioLights cheap />
      <Ring progress={progress} />
    </View>
  );
}
