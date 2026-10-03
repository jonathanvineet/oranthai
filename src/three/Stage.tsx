import { Canvas, useFrame } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useMotion } from "../lib/motion";

// drei's views disable autoClear and take over the render loop, so wipe the whole
// canvas once per frame (priority 0 runs before the views) or moved views leave trails.
function ClearEachFrame() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, false);
  }, 0);
  return null;
}

// One shared WebGL canvas for the whole page. Each section renders a <View> that
// scissors into this canvas over its own DOM box, so there is only ever one GL context.
export default function Stage({ mobile }: { mobile: boolean }) {
  const { markStageReady } = useMotion();
  return (
    <Canvas
      onCreated={markStageReady}
      eventSource={document.getElementById("root")!}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10 }}
      dpr={[1, mobile ? 1.5 : 2]}
      gl={{ alpha: true, antialias: !mobile, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <ClearEachFrame />
      <View.Port />
    </Canvas>
  );
}
