import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function Model({ rotationZ = 0, rotationY = 0, exitSpin = false, entranceSpin = false, celebrate = false }) {
  const { scene } = useGLTF('/Iron_Owl_Sentinel.glb');
  const groupRef = useRef();
  const elapsed = useRef(0);
  const spinElapsed = useRef(0);
  const prevExit = useRef(false);
  const prevEntrance = useRef(false);

  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    scene.position.sub(center);
  }, [scene]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (exitSpin !== prevExit.current || entranceSpin !== prevEntrance.current) {
      spinElapsed.current = 0;
      prevExit.current = exitSpin;
      prevEntrance.current = entranceSpin;
    }
    spinElapsed.current += delta;
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(elapsed.current * 0.55) * 0.07;
    const baseY = rotationY * (Math.PI / 180);
    const wobble = (exitSpin || entranceSpin) ? 0 : Math.sin(elapsed.current * 0.3) * 0.06;
    const exitS = exitSpin ? spinElapsed.current * 7 : 0;
    const entS = entranceSpin ? -(Math.PI * 2) * Math.max(0, 1 - spinElapsed.current * 1.2) : 0;
    const celebS = celebrate ? spinElapsed.current * 5 : 0;
    const celebBob = celebrate ? Math.sin(elapsed.current * 8) * 0.18 : 0;
    groupRef.current.rotation.y = baseY + wobble + exitS + entS + celebS;
    groupRef.current.rotation.z = rotationZ * (Math.PI / 180);
    if (celebrate) groupRef.current.position.y = Math.sin(elapsed.current * 8) * 0.15;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.0} />
    </group>
  );
}

let owlHasMounted = false;

export default function OwlSentinel({ visible, phase, rotationZ = 0, rotationY = 0, celebrate = false }) {
  const ready = useRef(owlHasMounted);
  const [exitSpin, setExitSpin] = useState(false);
  const [entranceSpin, setEntranceSpin] = useState(false);
  const prevVisible = useRef(visible);
  const spinStart = useRef(0);

  useEffect(() => {
    if (visible && !owlHasMounted) {
      owlHasMounted = true;
      ready.current = true;
    }
    if (!visible && prevVisible.current) {
      setExitSpin(true);
      setEntranceSpin(false);
    }
    if (visible && !prevVisible.current) {
      setExitSpin(false);
      setEntranceSpin(true);
      setTimeout(() => setEntranceSpin(false), 900);
    }
    prevVisible.current = visible;
  }, [visible]);

  return (
    <motion.div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      initial={ready.current ? false : { opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0, scale: 1 }}
      transition={visible
        ? { opacity: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }, scale: { type: 'spring', stiffness: 260, damping: 14 } }
        : { opacity: { duration: 0.5, ease: 'easeIn' }, scale: { duration: 0 } }
      }
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
        <Model rotationZ={rotationZ} rotationY={rotationY} exitSpin={exitSpin} entranceSpin={entranceSpin} celebrate={celebrate} />
      </Canvas>
    </motion.div>
  );
}

useGLTF.preload('/Iron_Owl_Sentinel.glb');
