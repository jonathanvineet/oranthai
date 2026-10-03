import { forwardRef, useEffect, useRef, useState } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

// Procedural still-life props for the hero orbit: books, a wristwatch and a gift box.
// Each is roughly 1 unit across so the orbit can scale them uniformly. Colours follow the
// brochure's pastel washes with the navy and blue brand inks.

type G = ThreeElements["group"];

function useMats<T extends Record<string, THREE.Material>>(make: () => T) {
  // Materials are created once per mounted prop and disposed with it.
  const [mats] = useState(make);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  return mats;
}

/** Three stacked hardbacks with cream page edges, slightly fanned. */
export const Books = forwardRef<THREE.Group, G>(function Books(props, ref) {
  const m = useMats(() => ({
    navy: new THREE.MeshStandardMaterial({ color: "#163a63", roughness: 0.6 }),
    blue: new THREE.MeshStandardMaterial({ color: "#2a6fd2", roughness: 0.55 }),
    peach: new THREE.MeshStandardMaterial({ color: "#f3c9a8", roughness: 0.6 }),
    pages: new THREE.MeshStandardMaterial({ color: "#fbf4e4", roughness: 0.9 }),
    gold: new THREE.MeshStandardMaterial({ color: "#e8cb9a", roughness: 0.35, metalness: 0.6 }),
  }));
  const book = (cover: THREE.Material, y: number, rot: number, w = 1, d = 0.72) => (
    <group position={[0, y, 0]} rotation={[0, rot, 0]}>
      <mesh material={cover}>
        <boxGeometry args={[w, 0.2, d]} />
      </mesh>
      {/* page block inset on three sides */}
      <mesh material={m.pages} position={[0.03, 0, 0]}>
        <boxGeometry args={[w - 0.02, 0.15, d - 0.05]} />
      </mesh>
      {/* gilt band on the spine */}
      <mesh material={m.gold} position={[-w / 2 - 0.002, 0.03, 0]}>
        <boxGeometry args={[0.005, 0.03, d * 0.8]} />
      </mesh>
    </group>
  );
  return (
    <group ref={ref} {...props}>
      {book(m.navy, -0.21, 0.08, 1.05, 0.76)}
      {book(m.peach, 0, -0.12, 0.95, 0.7)}
      {book(m.blue, 0.21, 0.18, 0.88, 0.66)}
    </group>
  );
});

/** A steel wristwatch on a navy strap; the second hand ticks in real time. */
export const Watch = forwardRef<THREE.Group, G>(function Watch(props, ref) {
  const m = useMats(() => ({
    steel: new THREE.MeshStandardMaterial({ color: "#dfe3ea", roughness: 0.2, metalness: 0.95 }),
    face: new THREE.MeshStandardMaterial({ color: "#f9f7ea", roughness: 0.6 }),
    navy: new THREE.MeshStandardMaterial({ color: "#0b2545", roughness: 0.5 }),
    strap: new THREE.MeshStandardMaterial({ color: "#163a63", roughness: 0.75 }),
    accent: new THREE.MeshBasicMaterial({ color: "#1e63c6" }),
  }));
  const seconds = useRef<THREE.Group>(null);
  useFrame(() => {
    if (seconds.current) seconds.current.rotation.z = -Math.floor(Date.now() / 1000) * ((Math.PI * 2) / 60);
  });
  return (
    <group ref={ref} {...props}>
      {/* strap loop behind the case */}
      <mesh material={m.strap} position={[0, 0, -0.42]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1.3, 1]}>
        <torusGeometry args={[0.45, 0.07, 10, 48]} />
      </mesh>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={m.steel}>
          <cylinderGeometry args={[0.36, 0.36, 0.14, 48]} />
        </mesh>
        <mesh material={m.steel} position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
        </mesh>
      </group>
      <mesh material={m.face} position={[0, 0, 0.072]}>
        <circleGeometry args={[0.3, 48]} />
      </mesh>
      {/* hour markers */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} material={m.navy} position={[Math.sin(a) * 0.25, Math.cos(a) * 0.25, 0.075]} rotation={[0, 0, -a]}>
            <planeGeometry args={[0.02, i % 3 ? 0.04 : 0.07]} />
          </mesh>
        );
      })}
      <mesh material={m.navy} position={[0.05, 0.06, 0.078]} rotation={[0, 0, -0.9]}>
        <planeGeometry args={[0.03, 0.17]} />
      </mesh>
      <mesh material={m.navy} position={[-0.07, 0.03, 0.079]} rotation={[0, 0, 1.15]}>
        <planeGeometry args={[0.025, 0.24]} />
      </mesh>
      <group ref={seconds} position={[0, 0, 0.081]}>
        <mesh material={m.accent} position={[0, 0.1, 0]}>
          <planeGeometry args={[0.01, 0.24]} />
        </mesh>
      </group>
    </group>
  );
});

/** A peach gift box tied with a blue ribbon and bow. */
export const GiftBox = forwardRef<THREE.Group, G>(function GiftBox(props, ref) {
  const m = useMats(() => ({
    box: new THREE.MeshStandardMaterial({ color: "#f6bf9b", roughness: 0.7 }),
    lid: new THREE.MeshStandardMaterial({ color: "#f2b28a", roughness: 0.65 }),
    ribbon: new THREE.MeshStandardMaterial({ color: "#2a6fd2", roughness: 0.4, metalness: 0.1 }),
  }));
  return (
    <group ref={ref} {...props}>
      <mesh material={m.box} position={[0, -0.05, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
      </mesh>
      <mesh material={m.lid} position={[0, 0.28, 0]}>
        <boxGeometry args={[0.86, 0.12, 0.86]} />
      </mesh>
      <mesh material={m.ribbon} position={[0, 0.05, 0]}>
        <boxGeometry args={[0.14, 0.82, 0.88]} />
      </mesh>
      <mesh material={m.ribbon} position={[0, 0.05, 0]}>
        <boxGeometry args={[0.88, 0.82, 0.14]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={m.ribbon} position={[s * 0.13, 0.42, 0]} rotation={[Math.PI / 2, 0, s * 0.5]} scale={[1, 1, 0.55]}>
          <torusGeometry args={[0.12, 0.035, 8, 24]} />
        </mesh>
      ))}
    </group>
  );
});
