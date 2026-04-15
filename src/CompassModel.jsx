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
    if (!groupRef.current) return;
    groupRef.current.rotation.x = -0.68;
    groupRef.current.rotation.y = 0;
    groupRef.current.rotation.z -= delta * 0.0524; // match orbit 120s per rotation, counter-clockwise
    groupRef.current.position.set(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.0} />
    </group>
  );
}

export default function CompassModel({ visible, onClick, offsetX = 295, offsetY = 295 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onClick={visible ? onClick : undefined}
      onMouseEnter={() => visible && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: offsetX,
        top: offsetY,
        width: 240,
        height: 240,
        marginLeft: -120,
        marginTop: -120,
        zIndex: 20,
        cursor: visible ? 'pointer' : 'default',
      }}
      initial={{ opacity: 0, scale: 0.72 }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.72,
      }}
      whileTap={{ scale: 0.97 }}
      transition={{
        opacity: { duration: visible ? 1.0 : 0.3, delay: visible ? 1.6 : 0, ease: [0.22, 1, 0.36, 1] },
        scale:   { type: 'spring', stiffness: 260, damping: 18, delay: visible ? 1.6 : 0 },
      }}
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
          ✦ Recovery Wisdom
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
