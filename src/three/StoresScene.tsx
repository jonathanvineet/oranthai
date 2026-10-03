import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import { branches } from "../data/site";
import { ROUTE, TN_OUTLINE, project } from "../data/tamilnadu";
import { STORES_TIMING, span } from "../sections/storesTiming";
import { Pencil, setGroupOpacity, type PencilHandle } from "./Pencil";
import { StudioLights } from "./StudioLights";
import type { Progress } from "../lib/motion";

const DEPTH = 0.22;
const DASHES = 20;
const PENCIL_WORLD_LENGTH = 1.5;

export type Leader = { line: SVGLineElement | null; badge: HTMLElement | null };

type Props = {
  progress: Progress;
  mapRef: RefObject<HTMLElement | null>;
  sectionRef: RefObject<HTMLElement | null>;
  leaders: RefObject<Leader[]>;
};

const easeOutBack = (t: number) => {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

function useMapGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape(TN_OUTLINE.map((p) => new THREE.Vector2(...project(p))));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1, curveSegments: 1 });
    geo.computeVertexNormals();
    const edge = new THREE.BufferGeometry().setFromPoints([...TN_OUTLINE, TN_OUTLINE[0]].map((p) => new THREE.Vector3(...project(p), DEPTH + 0.045)));
    const curve = new THREE.CatmullRomCurve3(ROUTE.map((p) => new THREE.Vector3(...project(p), DEPTH + 0.05)));
    return { geo, edge, curve };
  }, []);
}

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, "rgba(11,37,69,0.32)");
  grad.addColorStop(1, "rgba(11,37,69,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function MapRig({ progress, mapRef, sectionRef, leaders }: Props) {
  const { geo, edge, curve } = useMapGeometry();
  const shadow = useMemo(shadowTexture, []);
  const tilt = useRef<THREE.Group>(null);
  const pins = useRef<(THREE.Group | null)[]>([]);
  const heads = useRef<(THREE.Object3D | null)[]>([]);
  const dashes = useRef<THREE.InstancedMesh>(null);
  const pencil = useRef<PencilHandle>(null);
  const pencilRig = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const mats = useMemo(
    () => ({
      top: new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#e6f0fb", emissiveIntensity: 0.75, roughness: 0.9, flatShading: true }),
      side: new THREE.MeshStandardMaterial({ color: "#2a6fd2", roughness: 0.55, flatShading: true }),
      edge: new THREE.LineBasicMaterial({ color: "#0b2545", transparent: true, opacity: 0.55 }),
      pin: new THREE.MeshStandardMaterial({ color: "#1e63c6", roughness: 0.35, metalness: 0.1 }),
      head: new THREE.MeshStandardMaterial({ color: "#0b2545", roughness: 0.35, metalness: 0.15 }),
      dot: new THREE.MeshBasicMaterial({ color: "#f4f8fd" }),
      dash: new THREE.MeshBasicMaterial({ color: "#0b2545" }),
      shadow: new THREE.MeshBasicMaterial({ map: shadow, transparent: true, depthWrite: false }),
    }),
    [shadow],
  );
  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
      geo.dispose();
      edge.dispose();
      shadow.dispose();
    },
    [mats, geo, edge, shadow],
  );

  // Lay dashes along the route once; drawing just changes how many are shown.
  useEffect(() => {
    const m = dashes.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < DASHES; i++) {
      const t = (i + 0.5) / DASHES;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      o.position.copy(p);
      o.rotation.set(0, 0, Math.atan2(tan.y, tan.x));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.count = 0;
  }, [curve]);

  const v = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const xAxis = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const zUp = useMemo(() => new THREE.Vector3(0, 0, 1), []);

  useFrame((state) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const g = tilt.current;
    if (!g) return;

    const tp = span(p, STORES_TIMING.tilt);
    g.rotation.x = THREE.MathUtils.lerp(-0.35, -0.92, tp);
    g.rotation.z = THREE.MathUtils.lerp(0.12, -0.06, tp) + Math.sin(t * 0.4) * 0.01;
    // Upright the map is tall, so it grows as it lies back to keep filling the frame.
    g.scale.setScalar(THREE.MathUtils.lerp(1.05, 1.38, tp));

    // Pins rise one after another.
    branches.forEach((b, i) => {
      const pin = pins.current[i];
      if (!pin) return;
      const r = span(p, STORES_TIMING.pins[b.id]);
      pin.visible = r > 0.001;
      pin.scale.setScalar(Math.max(0.001, easeOutBack(r)));
    });

    // Route: dashes appear as the pencil travels from Chennai to Thanjavur.
    const rp = span(p, STORES_TIMING.route);
    if (dashes.current) dashes.current.count = Math.round(rp * DASHES);
    const rig = pencilRig.current;
    if (rig && pencil.current) {
      const tip = curve.getPointAt(Math.min(0.999, Math.max(0.001, rp)));
      const tan = curve.getTangentAt(Math.min(0.999, Math.max(0.001, rp)));
      // Pencil axis points down onto the paper along the direction of travel.
      dir.copy(tan).multiplyScalar(Math.cos(0.75)).addScaledVector(zUp, -Math.sin(0.75)).normalize();
      const k = PENCIL_WORLD_LENGTH / 6;
      rig.scale.setScalar(k);
      rig.quaternion.setFromUnitVectors(xAxis, dir);
      rig.position.copy(tip).addScaledVector(dir, -3 * k);
      const show = span(p, [STORES_TIMING.route[0] - 0.05, STORES_TIMING.route[0]]) * (1 - span(p, [STORES_TIMING.route[1], STORES_TIMING.route[1] + 0.05]));
      setGroupOpacity(rig, show);
    }

    // Leader lines from each pin head to its HTML badge.
    const map = mapRef.current;
    const sec = sectionRef.current;
    const list = leaders.current;
    if (!map || !sec || !list) return;
    const mr = map.getBoundingClientRect();
    const sr = sec.getBoundingClientRect();
    branches.forEach((b, i) => {
      const L = list[i];
      const head = heads.current[i];
      if (!L?.line || !L.badge || !head) return;
      const r = span(p, STORES_TIMING.pins[b.id]);
      head.getWorldPosition(v);
      v.project(camera);
      const x = mr.left - sr.left + ((v.x + 1) / 2) * mr.width;
      const y = mr.top - sr.top + ((1 - v.y) / 2) * mr.height;
      const br = L.badge.getBoundingClientRect();
      const bx = br.left - sr.left + 6;
      const by = br.top - sr.top + br.height / 2;
      L.line.setAttribute("x1", x.toFixed(1));
      L.line.setAttribute("y1", y.toFixed(1));
      L.line.setAttribute("x2", THREE.MathUtils.lerp(x, bx, r).toFixed(1));
      L.line.setAttribute("y2", THREE.MathUtils.lerp(y, by, r).toFixed(1));
      L.line.style.opacity = String(r);
    });
  });

  return (
    <group ref={tilt} position={[0.3, -0.15, 0]}>
      <mesh position={[0.1, -0.2, -0.3]} scale={[5.6, 6.6, 1]} material={mats.shadow}>
        <planeGeometry />
      </mesh>
      <mesh geometry={geo} material={[mats.top, mats.side]} />
      <lineLoop geometry={edge} material={mats.edge} />
      <instancedMesh ref={dashes} args={[undefined, undefined, DASHES]} material={mats.dash}>
        <boxGeometry args={[0.07, 0.032, 0.012]} />
      </instancedMesh>
      {branches.map((b, i) => {
        const [x, y] = project([b.lon, b.lat]);
        return (
          <group key={b.id} position={[x, y, DEPTH + 0.04]} ref={(el) => void (pins.current[i] = el)}>
            <group rotation={[Math.PI / 2, 0, 0]}>
              <mesh position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]} material={b.headOffice ? mats.head : mats.pin}>
                <coneGeometry args={[0.075, 0.4, 16]} />
              </mesh>
              <mesh position={[0, 0.48, 0]} material={b.headOffice ? mats.head : mats.pin} ref={(el) => void (heads.current[i] = el)}>
                <sphereGeometry args={[b.headOffice ? 0.17 : 0.14, 24, 16]} />
              </mesh>
              <mesh position={[0, 0.48, 0.1]} material={mats.dot}>
                <sphereGeometry args={[0.055, 12, 8]} />
              </mesh>
              {b.headOffice && (
                <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.head}>
                  <torusGeometry args={[0.13, 0.018, 8, 32]} />
                </mesh>
              )}
            </group>
          </group>
        );
      })}
      <group ref={pencilRig}>
        <Pencil ref={pencil} />
      </group>
    </group>
  );
}

export default function StoresScene(props: Props) {
  return (
    <View className="pointer-events-none absolute inset-0">
      <PerspectiveCamera makeDefault position={[0, 0, 14]} fov={30} />
      <StudioLights />
      <MapRig {...props} />
    </View>
  );
}
