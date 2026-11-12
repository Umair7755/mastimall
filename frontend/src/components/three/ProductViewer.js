"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function ProductViewer({ url }) {
  return (
    <div className="relative h-full min-h-72 w-full">
      <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ fov: 35 }}>
        <Stage environment={null} intensity={1} adjustCamera>
          <Model url={url} />
        </Stage>
        <OrbitControls makeDefault enablePan={false} minDistance={2} maxDistance={6} />
      </Canvas>
      <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-sm text-ink-muted">Drag to turn</p>
    </div>
  );
}
