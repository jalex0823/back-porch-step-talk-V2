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

export default function CompassModel({ visible }) {
  // Orbit area is 480x480, center is at 240,240. Canvas is 220x220 so offset is -110.
  return (
    <motion.div
      className="pointer-events-none"
      style={{
        position: 'absolute',
        left: 273,
        top: 260,
        width: 240,
        height: 240,
        marginLeft: -120,
        marginTop: -120,
        zIndex: 1,
        opacity: 0,
      }}
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: visible ? 0.52 : 0, scale: visible ? 1 : 0.75 }}
      transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
    >
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
