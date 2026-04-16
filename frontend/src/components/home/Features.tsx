import React from 'react';
import { Cpu, LayoutTemplate, ChevronRight } from 'lucide-react';

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-black/50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Feature 1 */}
          <div className="bento-card group">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-neon-green)]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Cpu className="w-7 h-7 text-[var(--color-neon-green)]" />
            </div>
            <h3 className="card-title">Productivity Boost</h3>
            <p className="card-body mb-8 line-clamp-3">
              Let the AI handle the boilerplate, debugging, and infrastructure. Focus on the business logic while the agent writes the code, tests it, and ensures it meets production standards.
            </p>
            <button className="text-[var(--color-neon-green)] font-medium flex items-center gap-2 hover:gap-3 transition-all text-sm">
              Learn More <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Feature 2 */}
          <div className="bento-card group">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-neon-purple)]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <LayoutTemplate className="w-7 h-7 text-[var(--color-neon-purple)]" />
            </div>
            <h3 className="card-title text-[var(--color-neon-purple)]">Cross Device Ready</h3>
            <p className="card-body mb-8 line-clamp-3">
              The agent automatically generates responsive layouts, tests them across different viewport sizes, and ensures your application looks perfect on mobile, tablet, and desktop.
            </p>
            <button className="text-[var(--color-neon-purple)] font-medium flex items-center gap-2 hover:gap-3 transition-all text-sm">
              Learn More <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
