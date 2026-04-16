import React from 'react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black/80 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="font-display font-bold text-lg">
                <span className="text-[#00ff66]">&lt;/</span>AutoForge<span className="text-[#00ff66]">&gt;</span>
              </span>
            </div>
            <p className="text-sm text-gray-500">Revolutionizing software development with autonomous AI agents.</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-white">Solution</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-[#00ff66] transition-colors">AI Agent</a></li>
              <li><a href="#" className="hover:text-[#00ff66] transition-colors">Self-Healing</a></li>
              <li><a href="#" className="hover:text-[#00ff66] transition-colors">LLM Evaluation</a></li>

            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">Info</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-[#00ff66] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#00ff66] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#00ff66] transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-[#00ff66] transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-[#00ff66] transition-colors">API Reference</a></li>

              <li><a href="#" className="hover:text-[#00ff66] transition-colors">Status</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>&copy; {new Date().getFullYear()} AutoForge. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
