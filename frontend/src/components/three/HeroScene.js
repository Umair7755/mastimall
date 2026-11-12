"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, RoundedBox } from "@react-three/drei";

/** Toys + décor — same scene serves both shop moods. */
const PIECES = [
  // Toy blocks (play)
  {
    kind: "block",
    pos: [-1.55, 0.35, 0.1],
    color: "#4338CA",
    rot: [0.25, 0.45, -0.08],
    size: 1.15,
    face: true,
  },
  {
    kind: "block",
    pos: [0.15, -0.55, 0.45],
    color: "#FBBF24",
    rot: [0.12, -0.55, 0.18],
    size: 0.95,
    face: true,
  },
  {
    kind: "block",
    pos: [1.45, 0.75, -0.2],
    color: "#E0475B",
    rot: [0.35, 0.25, -0.12],
    size: 0.88,
    face: true,
  },
  {
    kind: "block",
    pos: [-0.35, 1.45, -0.55],
    color: "#22C55E",
    rot: [0.18, 0.55, 0.22],
    size: 0.72,
    face: true,
  },
  // Décor accents (home)
  {
    kind: "orb",
    pos: [1.85, -0.55, 0.35],
    color: "#C4B5FD",
    rot: [0, 0, 0],
    size: 0.42,
  },
  {
    kind: "vase",
    pos: [-1.95, -0.7, 0.2],
    color: "#FB7185",
    rot: [0.1, 0.3, 0],
    size: 0.55,
  },
  {
    kind: "ring",
    pos: [0.85, 1.55, -0.15],
    color: "#FDE68A",
    rot: [0.6, 0.2, 0.4],
    size: 0.38,
  },
  {
    kind: "cushion",
    pos: [-0.9, -1.05, 0.55],
    color: "#A7F3D0",
    rot: [0.2, -0.4, 0.1],
    size: 0.7,
  },
];

function BlockFace({ size }) {
  const eye = size * 0.09;
  const y = size * 0.12;
  const z = size * 0.52;
  return (
    <group>
      <mesh position={[-size * 0.18, y, z]}>
        <sphereGeometry args={[eye, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[size * 0.18, y, z]}>
        <sphereGeometry args={[eye, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[-size * 0.18, y, z + eye * 0.55]}>
        <sphereGeometry args={[eye * 0.45, 10, 10]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>
      <mesh position={[size * 0.18, y, z + eye * 0.55]}>
        <sphereGeometry args={[eye * 0.45, 10, 10]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>
    </group>
  );
}

function Piece({ kind, pos, color, rot, size, face, index }) {
  const group = useRef(null);
  const appearAt = index * 0.1;

  useFrame((state) => {
    if (!group.current) return;
    const t = Math.min(1, Math.max(0, (state.clock.elapsedTime - appearAt) / 0.85));
    const eased = 1 - (1 - t) ** 3;
    group.current.position.set(pos[0], pos[1] + (1 - eased) * 2.4, pos[2]);
    group.current.scale.setScalar(0.65 + eased * 0.35);
  });

  const material = useMemo(
    () => ({
      color,
      roughness: kind === "orb" || kind === "ring" ? 0.22 : 0.38,
      metalness: kind === "ring" ? 0.35 : kind === "orb" ? 0.15 : 0.05,
    }),
    [color, kind]
  );

  let mesh = null;
  if (kind === "block") {
    mesh = (
      <RoundedBox args={[size, size, size]} radius={size * 0.18} smoothness={4} rotation={rot}>
        <meshStandardMaterial {...material} />
        {face ? <BlockFace size={size} /> : null}
      </RoundedBox>
    );
  } else if (kind === "orb") {
    mesh = (
      <mesh rotation={rot}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial {...material} />
      </mesh>
    );
  } else if (kind === "vase") {
    mesh = (
      <group rotation={rot}>
        <mesh position={[0, -size * 0.15, 0]}>
          <cylinderGeometry args={[size * 0.28, size * 0.42, size * 1.1, 24]} />
          <meshStandardMaterial {...material} />
        </mesh>
        <mesh position={[0, size * 0.45, 0]}>
          <torusGeometry args={[size * 0.22, size * 0.06, 12, 24]} />
          <meshStandardMaterial {...material} />
        </mesh>
      </group>
    );
  } else if (kind === "ring") {
    mesh = (
      <mesh rotation={rot}>
        <torusGeometry args={[size, size * 0.28, 16, 48]} />
        <meshStandardMaterial {...material} />
      </mesh>
    );
  } else if (kind === "cushion") {
    mesh = (
      <RoundedBox args={[size * 1.35, size * 0.45, size]} radius={size * 0.2} smoothness={4} rotation={rot}>
        <meshStandardMaterial {...material} />
      </RoundedBox>
    );
  }

  return (
    <group ref={group} position={pos}>
      <Float speed={1.15 + (index % 3) * 0.2} rotationIntensity={0.45} floatIntensity={0.95}>
        {mesh}
      </Float>
    </group>
  );
}

function Spark({ position, delay = 0 }) {
  const ref = useRef(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + delay;
    const pulse = 0.55 + Math.sin(t * 2.4) * 0.45;
    ref.current.scale.setScalar(pulse * 0.12);
    ref.current.rotation.z = t * 0.8;
  });
  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.6} roughness={0.3} />
    </mesh>
  );
}

function Rig({ children }) {
  const group = useRef(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    const step = Math.min(1, delta * 2.6);
    // Pointer parallax + slow idle spin for depth
    const targetY = state.pointer.x * 0.32 + Math.sin(state.clock.elapsedTime * 0.25) * 0.08;
    const targetX = -state.pointer.y * 0.18 + Math.cos(state.clock.elapsedTime * 0.2) * 0.04;
    group.current.rotation.y += (targetY - group.current.rotation.y) * step;
    group.current.rotation.x += (targetX - group.current.rotation.x) * step;
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene({ active = true }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.6]}
      camera={{ position: [0, 0.15, 6.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, premultipliedAlpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.style.background = "transparent";
      }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 7, 4]} intensity={1.35} color="#fff7ed" />
      <directionalLight position={[-4, 2, -3]} intensity={0.45} color="#c4b5fd" />
      <pointLight position={[0, 1.5, 2]} intensity={0.55} color="#fda4af" />

      <Rig>
        {PIECES.map((piece, index) => (
          <Piece key={`${piece.kind}-${piece.color}-${index}`} index={index} {...piece} />
        ))}
        <Spark position={[-2.2, 1.4, 0.6]} delay={0.2} />
        <Spark position={[2.1, 1.1, 0.3]} delay={1.1} />
        <Spark position={[0.2, 2.05, -0.4]} delay={0.7} />
      </Rig>

      <ContactShadows
        position={[0, -1.55, 0]}
        opacity={0.28}
        scale={12}
        blur={2.6}
        far={4}
        color="#312e81"
      />
    </Canvas>
  );
}
