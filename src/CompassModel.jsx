import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function Model() {
  const { scene } = useGLTF('/future_compass.glb');
  const groupRef = useRef();
  const clock = useRef(0);

  // Center the model geometry once on load
  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    scene.position.sub(center);
    // Rotate the scene so the compass face points at the camera
    scene.rotation.x = -Math.PI / 2;
  }, [scene]);

  useFrame((_, delta) => {
    clock.current += delta;
    if (!groupRef.current) return;
    // Very slow sun-style spin (~120s per rotation)
    groupRef.current.rotation.z += delta * 0.052;
    // Floating bob — gentle up/down drift
    groupRef.current.position.y = Math.sin(clock.current * 0.45) * 0.12;
    groupRef.current.position.x = Math.cos(clock.current * 0.31) * 0.06;
    // Wobble — noticeable rocking on X and Y axes at different tempos
    groupRef.current.rotation.x = -0.68 + Math.sin(clock.current * 0.38) * 0.18;
    groupRef.current.rotation.y = Math.cos(clock.current * 0.27) * 0.14;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.0} />
    </group>
  );
}

export default function CompassModel({ visible, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onClick={visible ? onClick : undefined}
      onMouseEnter={() => visible && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: 273,
        top: 260,
        width: 240,
        height: 240,
        marginLeft: -120,
        marginTop: -120,
        zIndex: 1,
        cursor: visible ? 'pointer' : 'default',
      }}
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.75 }}
      whileTap={{ scale: 1.18, transition: { type: 'spring', stiffness: 420, damping: 14 } }}
      transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Hover tooltip */}
      <motion.div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{ bottom: '105%', whiteSpace: 'nowrap', zIndex: 10 }}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
        transition={{ duration: 0.2 }}
      >
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '0.5rem',
          letterSpacing: '0.18em',
          color: 'rgba(61,158,207,0.85)',
          background: 'rgba(10,14,20,0.85)',
          border: '1px solid rgba(61,158,207,0.25)',
          borderRadius: '4px',
          padding: '3px 8px',
          textTransform: 'uppercase',
        }}>
          ✦ AA Slogan
        </span>
      </motion.div>
      <Canvas
        camera={{ position: [0, 0.18, 3.0], fov: 44 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 5, 4]} intensity={1.4} />
        <pointLight position={[-3, 3, 2]} intensity={0.6} color="#3d9ecf" />
        <pointLight position={[3, -2, 2]} intensity={0.3} color="#c08030" />
        <Environment preset="city" />
        <Model />
      </Canvas>
    </motion.div>
  );
}

useGLTF.preload('/future_compass.glb');
