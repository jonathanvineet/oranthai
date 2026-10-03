import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";

// A procedural hexagonal pencil lying along +X, centred on the origin, graphite tip at +X.
// End pieces have a fixed size relative to the thickness and only the painted body stretches,
// using the same proportions as the CSS .band--pencil so the two can swap invisibly.
export const PENCIL_RADIUS = 0.2;
const H = PENCIL_RADIUS * 2;
const ERASER = 1.1 * H;
const FERRULE = 0.9 * H;
const TIP = 1.7 * H;
const LEAD = TIP * 0.28;
const WOOD = TIP - LEAD;
export const PENCIL_DEFAULT_LENGTH = 6;

export type PencilHandle = { group: THREE.Group; setLength: (length: number) => void };

type Props = { segments?: number } & ThreeElements["group"];

export const Pencil = forwardRef<PencilHandle, Props>(function Pencil({ segments = 6, ...rest }, ref) {
  const group = useRef<THREE.Group>(null!);
  const parts = useRef<Record<string, THREE.Object3D>>({});
  const mats = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: "#2a6fd2", roughness: 0.42, metalness: 0.05, flatShading: true }),
      ferrule: new THREE.MeshStandardMaterial({ color: "#c9ced6", roughness: 0.3, metalness: 0.85 }),
      ring: new THREE.MeshStandardMaterial({ color: "#8e95a3", roughness: 0.35, metalness: 0.8 }),
      eraser: new THREE.MeshStandardMaterial({ color: "#eef1f5", roughness: 0.8 }),
      wood: new THREE.MeshStandardMaterial({ color: "#e8cb9a", roughness: 0.75, flatShading: true }),
      lead: new THREE.MeshStandardMaterial({ color: "#0b2545", roughness: 0.4, metalness: 0.3 }),
    }),
    [],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  const setLength = (length: number) => {
    const p = parts.current;
    const body = Math.max(0.1, length - ERASER - FERRULE - TIP);
    let x = -length / 2;
    const place = (o: THREE.Object3D | undefined, len: number) => {
      if (o) o.position.y = x + len / 2;
      x += len;
    };
    place(p.eraser, ERASER);
    if (p.cap) p.cap.position.y = -length / 2;
    place(p.ferrule, FERRULE);
    place(p.body, body);
    if (p.body) p.body.scale.y = body;
    place(p.wood, WOOD);
    place(p.lead, LEAD);
  };

  useLayoutEffect(() => setLength(PENCIL_DEFAULT_LENGTH));
  useImperativeHandle(ref, () => ({ group: group.current, setLength }), []);

  const r = PENCIL_RADIUS;
  const leadR = r * 0.3;
  const keep = (k: string) => (o: THREE.Object3D | null) => {
    if (o) parts.current[k] = o;
  };

  return (
    <group ref={group} {...rest}>
      {/* cylinders are built along Y, so rotate the stack onto X */}
      <group rotation={[0, 0, -Math.PI / 2]}>
        <mesh ref={keep("eraser")} material={mats.eraser}>
          <cylinderGeometry args={[r * 0.96, r * 0.96, ERASER, 24]} />
        </mesh>
        <mesh ref={keep("cap")} material={mats.eraser} scale={[1, 0.35, 1]}>
          <sphereGeometry args={[r * 0.96, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        </mesh>
        <group ref={keep("ferrule")}>
          <mesh material={mats.ferrule}>
            <cylinderGeometry args={[r * 1.04, r * 1.04, FERRULE, 24]} />
          </mesh>
          {[-0.3, -0.1, 0.1, 0.3].map((o) => (
            <mesh key={o} position={[0, o * FERRULE, 0]} material={mats.ring} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[r * 1.05, 0.012, 6, 24]} />
            </mesh>
          ))}
        </group>
        {/* unit height, stretched by setLength */}
        <mesh ref={keep("body")} material={mats.body}>
          <cylinderGeometry args={[r, r, 1, segments]} />
        </mesh>
        <mesh ref={keep("wood")} material={mats.wood}>
          <cylinderGeometry args={[leadR, r, WOOD, segments]} />
        </mesh>
        <mesh ref={keep("lead")} material={mats.lead}>
          <coneGeometry args={[leadR, LEAD, 16]} />
        </mesh>
      </group>
    </group>
  );
});

/** Fades every mesh under an object. Materials switch to transparent only while fading. */
export function setGroupOpacity(root: THREE.Object3D, opacity: number) {
  root.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | undefined;
    if (!m) return;
    m.transparent = opacity < 0.999;
    m.opacity = opacity;
    m.depthWrite = opacity > 0.5;
  });
  root.visible = opacity > 0.002;
}
