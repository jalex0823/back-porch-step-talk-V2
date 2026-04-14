import { useRef, useEffect } from 'react';
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

    // Tilt the scene so the compass face points toward the camera (+Z)
    // Most compass/disc GLBs lie flat on XZ plane — rotating X by -90deg makes it face +Z
    scene.rotation.x = -Math.PI / 2;
  }, [scene]);

  useFrame((_, delta) => {
    clock.current += delta;
    if (!groupRef.current) return;
    // Very slow spin — like the sun (full rotation ~60s)
    groupRef.current.rotation.z += delta * 0.10;
    // Gentle float (Y axis in world space)
    groupRef.current.position.y = Math.sin(clock.current * 0.55) * 0.06;
    // Subtle wobble tilt — feels alive
    groupRef.current.rotation.x = Math.sin(clock.current * 0.4) * 0.05;
    groupRef.current.rotation.y = Math.cos(clock.current * 0.3) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.0} />
    </group>
  );
}

export default function CompassModel({ visible }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ width: 200, height: 200, zIndex: 5 }}
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.75 }}
      transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 42 }}
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
