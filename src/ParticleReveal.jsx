import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function ParticleReveal({ children, accentColor = '#3d9ecf', duration = 1.4 }) {
  const [showContent, setShowContent] = useState(false);

  const particles = useMemo(() => {
    const count = 40;
    return Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 200;
      return {
        id: i,
        startX: Math.cos(angle) * dist,
        startY: Math.sin(angle) * dist,
        size: 2 + Math.random() * 5,
        delay: Math.random() * 0.4,
        opacity: 0.4 + Math.random() * 0.6,
      };
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), duration * 700);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className="relative">
      {/* Particles converging to center */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: showContent ? 0 : 10 }}>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: '50%',
              top: '50%',
              background: accentColor,
              boxShadow: `0 0 ${p.size * 2}px ${accentColor}`,
            }}
            initial={{
              x: p.startX,
              y: p.startY,
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              x: 0,
              y: 0,
              opacity: [0, p.opacity, p.opacity, 0],
              scale: [0.5, 1.2, 1, 0],
            }}
            transition={{
              duration: duration,
              delay: p.delay,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.4, 0.7, 1],
            }}
          />
        ))}

        {/* Central flash when particles converge */}
        <motion.div
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            background: `radial-gradient(circle, ${accentColor}, transparent 70%)`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 30, 40],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: duration * 0.6,
            delay: duration * 0.5,
            ease: 'easeOut',
          }}
        />
      </div>

      {/* Content with clip reveal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
        animate={{
          opacity: showContent ? 1 : 0,
          scale: showContent ? 1 : 0.92,
          filter: showContent ? 'blur(0px)' : 'blur(8px)',
        }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
