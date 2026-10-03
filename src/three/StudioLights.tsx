import { Environment, Lightformer } from "@react-three/drei";

// Soft studio lighting with a tiny procedural environment (no HDR download) so metal parts read as metal.
export function StudioLights({ cheap = false }: { cheap?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.55} color="#e6f0fb" />
      <directionalLight position={[4, 6, 8]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-6, -2, 4]} intensity={0.45} color="#bbd6f5" />
      {!cheap && (
        <Environment resolution={64} frames={1}>
          <Lightformer intensity={2.2} position={[0, 4, 4]} scale={[10, 2, 1]} color="#ffffff" />
          <Lightformer intensity={1.2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} color="#d3e5f9" />
          <Lightformer intensity={0.8} position={[5, -2, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#bbd6f5" />
        </Environment>
      )}
    </>
  );
}
