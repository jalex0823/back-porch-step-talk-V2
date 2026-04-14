import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';

function Model() {
  const { scene } = useGLTF('/future_compass.glb');
  const ref = useRef();
  const clock = useRef(0);

  useFrame((_, delta) => {
    clock.current += delta;
    if (!ref.current) return;
    // Slow Y-axis spin
    ref.current.rotation.y += delta * 0.35;
    // Gentle float up/down
    ref.current.position.y = Math.sin(clock.current * 0.7) * 0.08;
    // Subtle wobble tilt
    ref.current.rotation.x = Math.sin(clock.current * 0.5) * 0.06;
    ref.current.rotation.z = Math.cos(clock.current * 0.4) * 0.04;
  });

  return <primitive ref={ref} object={scene} scale={1.1} />;
}

export default function CompassModel({ visible }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ width: 160, height: 160, zIndex: 5 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 38 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 3]} intensity={1.2} />
        <pointLight position={[-2, 2, -2]} intensity={0.5} color="#3d9ecf" />
        <Environment preset="city" />
        <Model />
      </Canvas>
    </motion.div>
  );
}

useGLTF.preload('/future_compass.glb');
