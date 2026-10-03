import { forwardRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";

// Navy and blue fountain pen with a silver nib, lying along +X with the nib tip at +X.
// Same 6-unit length convention as <Pencil> so the two can swap in place.
export const PEN_LENGTH = 6;

export const FountainPen = forwardRef<THREE.Group, ThreeElements["group"]>(function FountainPen(props, ref) {
  const mats = useMemo(
    () => ({
      navy: new THREE.MeshStandardMaterial({ color: "#0b2545", roughness: 0.28, metalness: 0.2 }),
      blue: new THREE.MeshStandardMaterial({ color: "#2a6fd2", roughness: 0.25, metalness: 0.15 }),
      silver: new THREE.MeshStandardMaterial({ color: "#dfe3ea", roughness: 0.18, metalness: 0.95 }),
      slit: new THREE.MeshBasicMaterial({ color: "#0b2545" }),
    }),
    [],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  // Segment layout along the pen axis (built on Y, rotated onto X below).
  const r = 0.24;
  return (
    <group ref={ref} {...props}>
      <group rotation={[0, 0, -Math.PI / 2]}>
        {/* cap end */}
        <mesh position={[0, -3, 0]} material={mats.navy} scale={[1, 0.45, 1]}>
          <sphereGeometry args={[r, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        </mesh>
        {/* cap */}
        <mesh position={[0, -2.1, 0]} material={mats.navy}>
          <cylinderGeometry args={[r, r, 1.8, 32]} />
        </mesh>
        {/* clip */}
        <mesh position={[0, -2.25, r + 0.04]} material={mats.silver}>
          <boxGeometry args={[0.09, 1.3, 0.05]} />
        </mesh>
        <mesh position={[0, -1.62, r + 0.02]} material={mats.silver}>
          <sphereGeometry args={[0.07, 12, 8]} />
        </mesh>
        {/* cap band */}
        <mesh position={[0, -1.14, 0]} material={mats.silver}>
          <cylinderGeometry args={[r * 1.04, r * 1.04, 0.12, 32]} />
        </mesh>
        {/* barrel */}
        <mesh position={[0, 0.15, 0]} material={mats.blue}>
          <cylinderGeometry args={[r * 0.98, r * 0.98, 2.46, 32]} />
        </mesh>
        {/* grip */}
        <mesh position={[0, 1.78, 0]} material={mats.navy}>
          <cylinderGeometry args={[r * 0.7, r * 0.96, 0.8, 32]} />
        </mesh>
        <mesh position={[0, 2.2, 0]} material={mats.silver}>
          <cylinderGeometry args={[r * 0.72, r * 0.72, 0.05, 32]} />
        </mesh>
        {/* nib: a flattened cone with a slit and breather hole */}
        <group position={[0, 2.6, 0]} scale={[1, 1, 0.38]}>
          <mesh material={mats.silver}>
            <coneGeometry args={[r * 0.7, 0.8, 32]} />
          </mesh>
          <mesh position={[0, 0.12, r * 0.36]} material={mats.slit}>
            <boxGeometry args={[0.012, 0.5, 0.05]} />
          </mesh>
          <mesh position={[0, -0.15, r * 0.48]} rotation={[Math.PI / 2, 0, 0]} material={mats.slit}>
            <circleGeometry args={[0.035, 16]} />
          </mesh>
        </group>
      </group>
    </group>
  );
});
