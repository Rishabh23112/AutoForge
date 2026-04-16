import React, { useState } from 'react';
import { Send, Terminal } from 'lucide-react';
import { Message } from '../../types';

interface ChatSectionProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (prompt: string) => void;
  sessionId: string | null;
  status?: string;
}

export const ChatSection = ({ messages, isTyping, onSendMessage, sessionId, status }: ChatSectionProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="w-1/3 border-r border-white/10 flex flex-col bg-[#0a0a0a]">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-[#00ff66]/20 border border-[#00ff66]/50'}`}>
              {msg.role === 'user' ? 'U' : <Terminal className="w-4 h-4 text-[#00ff66]" />}
            </div>
            <div className={`p-3 rounded-xl text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'glass-panel border-white/10 text-gray-200 rounded-tl-none'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00ff66]/20 border border-[#00ff66]/50 flex items-center justify-center flex-shrink-0">
              <Terminal className="w-4 h-4 text-[#00ff66] animate-pulse" />
            </div>
            <div className="p-3 rounded-xl text-sm glass-panel border-white/10 text-gray-400 rounded-tl-none animate-pulse capitalize">
              {status || 'AutoForge is running the backend pipeline...'}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={sessionId ? 'Describe the next modification...' : 'Describe the app you want to build...'}
            className="w-full bg-[#111] border border-[#333] rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-[#00ff66]/50 transition-colors resize-none h-24"
          />
          <button type="submit" className="absolute right-3 bottom-3 p-2 bg-[#00ff66] text-black rounded-lg hover:bg-[#00cc52] transition-colors disabled:opacity-50" disabled={!inputValue.trim() || isTyping}>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
