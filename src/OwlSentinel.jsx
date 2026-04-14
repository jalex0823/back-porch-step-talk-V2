import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function Model() {
  const { scene } = useGLTF('/Iron_Owl_Sentinel.glb');
  const groupRef = useRef();
  const clock = useRef(0);

  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    scene.position.sub(center);
  }, [scene]);

  useFrame((_, delta) => {
    clock.current += delta;
    if (!groupRef.current) return;
    // Gentle float only — no rocking
    groupRef.current.position.y = Math.sin(clock.current * 0.55) * 0.07;
    // Very subtle Y turn so it feels alive
    groupRef.current.rotation.y = Math.sin(clock.current * 0.3) * 0.06;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.0} />
    </group>
  );
}

export default function OwlSentinel({ visible }) {
  return (
    <motion.div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
      transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ground glow shadow */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2"
        style={{
          width: '65%', height: 10,
          background: 'radial-gradient(ellipse, rgba(61,158,207,0.28) 0%, transparent 70%)',
          filter: 'blur(5px)',
        }}
      />
      <Canvas
        camera={{ position: [0, 0.1, 3.2], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 3]} intensity={1.3} />
        <pointLight position={[-2, 2, 2]} intensity={0.7} color="#3d9ecf" />
        <pointLight position={[2, -1, 1]} intensity={0.3} color="#c06020" />
        <spotLight position={[0, 4, 2]} angle={0.3} penumbra={0.8} intensity={0.8} />
        <Environment preset="city" />
        <Model />
      </Canvas>
    </motion.div>
  );
}

useGLTF.preload('/Iron_Owl_Sentinel.glb');
