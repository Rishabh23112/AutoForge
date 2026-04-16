import React, { useState, useEffect } from 'react';
import { useAutoForge } from '../hooks/useAutoForge';
import { useCodeStreaming } from '../hooks/useCodeStreaming';
import { ChatSection } from '../components/builder/ChatSection';
import { FileExplorer } from '../components/builder/FileExplorer';
import { ExecutionArea } from '../components/builder/ExecutionArea';

function pickDefaultFile(files: Record<string, string>): string {
  const keys = Object.keys(files);
  if (keys.length === 0) return 'No files';
  const appFile = keys.find((file) => /app\.(tsx|jsx|js|ts)$/i.test(file));
  return appFile ?? keys[0];
}

export const BuilderPage = () => {
  const {
    sessionId,
    lastBuild,
    isTyping,
    messages,
    currentFiles,
    sendMessage,
    resetSession,
  } = useAutoForge();

  const [activeFile, setActiveFile] = useState<string>('No files');
  const streamed = useCodeStreaming({
    files: currentFiles,
    isTyping,
    status: lastBuild?.status,
  });

  // Sync active file when build changes
  useEffect(() => {
    if (streamed.files && Object.keys(streamed.files).length > 0) {
      setActiveFile((previous) => {
        if (streamed.files[previous]) return previous;
        return pickDefaultFile(streamed.files);
      });
    }
  }, [streamed.files]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      <nav className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold tracking-tight">
            <span className="text-[#00ff66]">&lt;/</span>AutoForge<span className="text-[#00ff66]">&gt;</span>
          </span>
        </div>
        <button
          onClick={resetSession}
          className="text-xs font-medium px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
        >
          New Project
        </button>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <ChatSection 
          messages={messages} 
          isTyping={isTyping} 
          onSendMessage={sendMessage} 
          sessionId={sessionId} 
          status={lastBuild?.status}
        />
        
        <div className="flex-1 flex">
          <FileExplorer 
            files={streamed.files} 
            activeFile={activeFile} 
            onFileSelect={setActiveFile} 
          />
          <ExecutionArea 
            files={streamed.files} 
            activeFile={activeFile} 
            lastBuild={lastBuild}
            isStreamingCode={streamed.isStreaming}
          />
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;
