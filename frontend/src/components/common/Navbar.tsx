import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xl tracking-tight">
            <span className="text-[#00ff66]">&lt;/</span>AutoForge<span className="text-[#00ff66]">&gt;</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#platform" className="hover:text-white transition-colors">Platform</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/build" className="btn-glow">Start Building</Link>
        </div>

        <button className="md:hidden text-gray-300" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
};
