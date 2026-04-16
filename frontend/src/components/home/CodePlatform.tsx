import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Zap } from 'lucide-react';

export const CodePlatform = () => {
  return (
    <section id="platform" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[#b026ff] font-mono text-sm tracking-widest uppercase mb-4">Code Platform</div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Live interaction <br/>with your AI team</h2>
            <p className="text-gray-400 text-lg mb-8">
              Watch as the agent writes, tests, and refactors code in real-time. Collaborate with the AI just like you would with a human developer, but at 100x the speed.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                'Self-healing runtime error resolution',
                'Automated LLM-as-a-Judge evaluations',
                'One-click deployment & maintenance'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-[#00ff66]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link to="/build" className="px-6 py-3 rounded-full border border-white/20 hover:border-white/50 text-white font-medium transition-colors inline-block">
              Get Started Now
            </Link>
          </div>

          <div className="relative h-[500px]">
            {/* Layered Windows */}
            <div className="absolute top-0 right-0 w-[80%] h-[300px] glass-panel rounded-xl border-white/10 shadow-2xl p-4 transform translate-x-4 -translate-y-4 bg-black/40">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <div className="font-mono text-xs text-gray-400 space-y-2">
                <div><span className="text-blue-400">describe</span>(<span className="text-green-400">'Authentication'</span>, () =&gt; {'{'}</div>
                <div className="pl-4"><span className="text-blue-400">it</span>(<span className="text-green-400">'should self-heal on token expiry'</span>, <span className="text-purple-400">async</span> () =&gt; {'{'}</div>
                <div className="pl-8 text-gray-500">// LLM-as-a-Judge verifying fix...</div>
                <div className="pl-8"><span className="text-purple-400">await</span> agent.evaluateSecurity();</div>
                <div className="pl-4">{'}'});</div>
                <div>{'}'});</div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-[90%] h-[350px] glass-panel rounded-xl border-[#00ff66]/30 shadow-2xl p-4 neon-glow-green bg-black/80 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <div className="text-xs font-mono text-[#00ff66]">Terminal - Deployment</div>
                <Zap className="w-4 h-4 text-[#00ff66]" />
              </div>
              <div className="font-mono text-xs text-gray-300 space-y-2">
                <div className="text-gray-500">$ autoforge deploy --prod</div>
                <div>&gt; Analyzing dependencies... <span className="text-[#00ff66]">Done</span></div>
                <div>&gt; Running LLM evaluations... <span className="text-[#00ff66]">100% Pass</span></div>
                <div>&gt; Provisioning infrastructure...</div>
                <div className="text-[#b026ff] animate-pulse">Deploying to Edge Network...</div>
                <div className="text-[#00ff66] pt-2">✓ Successfully deployed to production!</div>
                <div className="text-gray-400">URL: https://app.autoforge.dev/live</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
