import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import laptopWorkspace from '@/assets/hero-workspace.png';
import exampleImage from '@/assets/hero-example.png';

/** Background decorations only — identical markup to the original Hero */
export const HeroDecorations: React.FC = () => (
  <>
    {/* Animated grid overlay */}
    <div
      className="absolute inset-0 pointer-events-none opacity-40"
      style={{
        backgroundImage:
          'linear-gradient(rgba(22,163,74,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(22,163,74,0.05) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }}
    />

    {/* Soft radial glows */}
    <div
      className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)',
        transform: 'translate(-30%, -30%)',
      }}
    />
    <div
      className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)',
        transform: 'translate(30%, 30%)',
      }}
    />

    {/* Professional Workspace Image - Background decoration */}
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 0.8, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="absolute top-[12%] right-[5%] w-[420px] h-[300px] pointer-events-none hidden lg:block opacity-40 mix-blend-multiply"
      style={{
        filter: 'brightness(1.05)',
      }}
    >
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 2, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img
          src={laptopWorkspace}
          alt="Professional Tender Workspace"
          className="w-full h-full object-cover rounded-[20px]"
          style={{
            boxShadow: '0 20px 60px rgba(22, 163, 74, 0.1)',
            border: '1px solid rgba(22, 163, 74, 0.1)',
          }}
        />
      </motion.div>
    </motion.div>

    {/* Animated document icon - Bottom Left */}
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="absolute bottom-[5%] left-[5%] pointer-events-none hidden md:block z-0 opacity-40 mix-blend-multiply"
    >
      <motion.div
        animate={{ 
          y: [0, -12, 0],
          rotate: [-2, 2, -2],
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src={exampleImage} 
          alt="Document Icon" 
          className="w-[200px] h-[200px] object-contain opacity-40"
        />
      </motion.div>
    </motion.div>

    {/* Animated shield icon - Bottom Right */}
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.15, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.5 }}
      className="absolute bottom-[20%] right-[12%] pointer-events-none hidden lg:block"
    >
      <motion.div
        animate={{ 
          y: [0, -12, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ShieldCheck size={100} style={{ color: '#16A34A' }} />
      </motion.div>
    </motion.div>

    {/* Floating particles */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          y: [0, -100, 0],
          x: [0, Math.random() * 50 - 25, 0],
        }}
        transition={{ 
          duration: 8 + i * 2,
          repeat: Infinity,
          delay: i * 1.5,
          ease: "easeInOut"
        }}
        className="absolute pointer-events-none"
        style={{
          left: `${10 + i * 15}%`,
          top: `${20 + (i % 3) * 20}%`,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: i % 2 === 0 ? '#14B8A6' : '#16A34A',
        }}
      />
    ))}
  </>
);
