import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Canvas } from '@react-three/fiber';
import { ChevronRight, Play } from 'lucide-react';
import { FloatingSymbols } from './FloatingSymbols';

export const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.from('.hero-element', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2
      });
      
      gsap.from('.hero-visual', {
        x: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.5
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden" ref={heroRef}>
      <div className="absolute inset-0 z-0 opacity-50">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <FloatingSymbols />
        </Canvas>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-neon-purple)]/20 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="hero-element text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight gradient-text">
              From Prompt to <br className="hidden md:block" />
              <span className="neon-text-green">Production-Ready</span> Code
            </h1>

            <p className="hero-element text-lg md:text-xl text-[var(--color-text-dim)] mb-10">
              The first autonomous AI agent that handles the complete SDLC. Generate, test, self-heal, and deploy full-stack applications instantly.
            </p>

            <div className="hero-element flex flex-col sm:flex-row items-start gap-4">
              <Link to="/build" className="btn-glow flex items-center justify-center gap-2">
                Get Started <ChevronRight className="w-5 h-5" />
              </Link>
              <button className="btn-outline flex items-center justify-center gap-2">
                <Play className="w-5 h-5" /> Watch Demo
              </button>
            </div>
          </div>

          {/* Right Column Visuals */}
          <div className="relative h-[500px] hidden lg:block">
            <div className="hero-visual absolute top-0 right-0 w-[80%] h-[300px] glass-panel rounded-xl border-white/10 shadow-2xl p-4 transform translate-x-4 -translate-y-4 bg-black/40">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <div className="font-mono text-xs text-gray-400 space-y-2">
                <span className="text-[#c678dd]">const</span> agent = <span className="text-[#c678dd]">new</span> <span className="text-[#61afef]">AutoForge</span>();<br/>
                <span className="text-[#c678dd]">await</span> agent.<span className="text-[#61afef]">analyze</span>(prompt);<br/>
                agent.<span className="text-[#61afef]">generateArchitecture</span>();<br/>
                <br/>
                <span className="text-[#5c6370]">// Self-healing execution</span><br/>
                <span className="text-[#c678dd]">try</span> {'{'}<br/>
                &nbsp;&nbsp;<span className="text-[#c678dd]">await</span> <span className="text-[#61afef]">build</span>();<br/>
                {'}'} <span className="text-[#c678dd]">catch</span> (e) {'{'}<br/>
                &nbsp;&nbsp;<span className="text-[#c678dd]">await</span> <span className="text-[#61afef]">heal</span>(e);<br/>
                {'}'}
              </div>
            </div>

            <div className="hero-visual absolute bottom-0 left-0 w-[90%] h-[250px] glass-panel rounded-xl border-[var(--color-neon-purple)]/30 shadow-2xl p-4 neon-glow-purple bg-black/80 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <div className="text-xs font-mono text-[var(--color-neon-purple)]">Agent Status</div>
                <div className="w-4 h-4 rounded-full bg-[var(--color-neon-purple)] animate-pulse" />
              </div>
              <div className="font-mono text-xs text-gray-300 space-y-2">
                <div>&gt; Initializing SDLC pipeline... <span className="text-[var(--color-neon-green)]">OK</span></div>
                <div>&gt; Generating frontend components... <span className="text-[var(--color-neon-green)]">OK</span></div>
                <div>&gt; Setting up Express backend... <span className="text-[var(--color-neon-green)]">OK</span></div>
                <div className="text-[var(--color-neon-purple)] animate-pulse pt-2">Running LLM-as-a-Judge evaluations...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
