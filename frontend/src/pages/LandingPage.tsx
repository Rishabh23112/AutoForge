import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Hero } from '../components/home/Hero';
import { CodePlatform } from '../components/home/CodePlatform';
import { Features } from '../components/home/Features';
import { Security } from '../components/home/Security';
import { Footer } from '../components/common/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00ff66]/30">
      <Navbar />
      <Hero />
      <CodePlatform />
      <Features />
      <Security />
      <Footer />
    </div>
  );
};

export default LandingPage;
