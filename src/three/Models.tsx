import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

// Sketchfab models (CC-BY-4.0, credited in the footer and public/models/CREDITS.txt), built by
// scripts/build-models.mjs. Each is re-centred, turned so its long axis runs along +X with the
// writing tip at +X where that matters, and scaled to the same conventions as the procedural props.

export const MODEL_URLS = {
  pen: "/models/luxury-pen.glb",
  books: "/models/pile-of-books.glb",
  gift: "/models/gift-box.glb",
  watch: "/models/apple-watch-ultra-2.glb",
} as const;

type Fit = { length: number } | { max: number };
type Options = {
  /** Euler rotation applied before measuring, to bring the model's long axis onto +X. */
  rotate?: [number, number, number];
  fit: Fit;
  /** Optional per-material adjustment, applied to private copies. */
  tweak?: (mat: THREE.MeshStandardMaterial) => void;
};

function useNormalisedModel(url: string, { rotate = [0, 0, 0], fit, tweak }: Options) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const root = scene.clone(true);
    // Private material copies: the orbit and morph fades change opacity per instance.
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const m = (mesh.material as THREE.MeshStandardMaterial).clone();
      tweak?.(m);
      mesh.material = m;
    });
    const turned = new THREE.Group();
    turned.rotation.set(...rotate);
    turned.add(root);
    turned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(turned);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const k = "length" in fit ? fit.length / size.x : fit.max / Math.max(size.x, size.y, size.z);
    const wrap = new THREE.Group();
    turned.position.sub(centre);
    wrap.add(turned);
    wrap.scale.setScalar(k);
    return wrap;
    // options are static per call site
  }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(
    () => () =>
      model.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) (mesh.material as THREE.Material).dispose();
      }),
    [model],
  );
  return model;
}

type G = ThreeElements["group"];

/** The pen model, tinted to the brochure's navy and blue: 6 units along +X (same as <FountainPen>), nib at +X. */
export function PenModel(props: G) {
  const model = useNormalisedModel(MODEL_URLS.pen, {
    // the source runs along Z with the nib toward +Z; a quarter turn about Y puts it on +X
    rotate: [0, Math.PI / 2, 0],
    fit: { length: 6 },
    tweak: (m) => {
      if (m.name === "Body") {
        m.color.set("#163a63");
        m.metalness = 0.35;
        m.roughness = 0.25;
      }
    },
  });
  return <primitive object={model} {...props} />;
}

export function BooksModel(props: G) {
  const model = useNormalisedModel(MODEL_URLS.books, { fit: { max: 1.15 } });
  return <primitive object={model} {...props} />;
}

export function GiftModel(props: G) {
  const model = useNormalisedModel(MODEL_URLS.gift, { fit: { max: 1.1 } });
  return <primitive object={model} {...props} />;
}

export function WatchModel(props: G) {
  const model = useNormalisedModel(MODEL_URLS.watch, { fit: { max: 1.15 } });
  return <primitive object={model} {...props} />;
}

/** Start fetching the small models as soon as a scene module loads (the watch is fetched on demand). */
export function preloadModels() {
  useGLTF.preload(MODEL_URLS.pen);
  useGLTF.preload(MODEL_URLS.books);
  useGLTF.preload(MODEL_URLS.gift);
}
