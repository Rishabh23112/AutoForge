import React from 'react';
import { Lock, Star } from 'lucide-react';

export const Security = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00ff66]/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="glass-panel p-8 rounded-2xl border-white/10 relative z-10 bg-black/40">
            <div className="flex gap-1 mb-6">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />)}
            </div>
            <p className="text-xl font-medium leading-relaxed mb-6">
              "The self-healing capability is mind-blowing. It caught a race condition in our auth flow, wrote a test for it, and deployed the fix before our monitoring even alerted us."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900" />
              <div>
                <div className="font-bold">Rishabh</div>
                <div className="text-sm text-gray-400">User</div>
              </div>
            </div>
          </div>
          
          {/* Overlaid Code Snippet */}
          <div className="absolute -bottom-10 -right-10 glass-panel p-4 rounded-xl border-[#b026ff]/30 bg-black/90 z-20 hidden md:block neon-glow-purple">
            <div className="font-mono text-xs text-gray-300">
              <span className="text-gray-500">// Security Audit Passed</span><br/>
              <span className="text-purple-400">const</span> isSecure = <span className="text-blue-400">await</span> agent.verify();<br/>
              <span className="text-purple-400">if</span> (isSecure) {'{'}<br/>
              &nbsp;&nbsp;deploy.execute();<br/>
              {'}'}
            </div>
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-6">
            <Lock className="w-4 h-4 text-[#00ff66]" /> Enterprise Grade
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Secure by design</h2>
          <p className="text-gray-400 text-lg mb-8">
            Every line of code generated is evaluated by our LLM-as-a-Judge system against OWASP top 10 vulnerabilities. The agent won't deploy until the security score is 100%.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-display font-bold text-white mb-2">100%</div>
              <div className="text-sm text-gray-400">Automated Audit</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-white mb-2">0ms</div>
              <div className="text-sm text-gray-400">Downtime Deploy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
