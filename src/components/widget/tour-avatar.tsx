import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface AvatarSphereProps {
  isActive: boolean;
}

const AvatarSphere: React.FC<AvatarSphereProps> = ({ isActive }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y += 0.005;

      // Pulse effect when active
      if (isActive) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color="#0d9488"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};

const particleCount = 50;
const particlePositions = (() => {
  const pos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 4;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }
  return pos;
})();

const FloatingParticles: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);

  const positions = React.useMemo(() => particlePositions, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
      particlesRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#2dd4bf"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

interface TourAvatarProps {
  isActive?: boolean;
  size?: number;
}

const TourAvatar: React.FC<TourAvatarProps> = ({
  isActive = true,
  size = 120,
}) => {
  return (
    <div
      className="relative rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full animate-pulse-glow"
        style={{
          background:
            "radial-gradient(circle, hsl(174 80% 50% / 0.2), transparent 70%)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#2dd4bf" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#0d9488"
        />
        <AvatarSphere isActive={isActive} />
        <FloatingParticles />
      </Canvas>
    </div>
  );
};

export default TourAvatar;
