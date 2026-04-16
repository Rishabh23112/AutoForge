import { useState, useEffect, useMemo, useRef } from 'react';
import { BuildResponse, Message } from '../types';
import { buildProject, modifyProject, getSession, streamSession } from '../services/api';

const TERMINAL_STATUSES = new Set(['success', 'failed']);

function isTerminalStatus(status?: string): boolean {
  return Boolean(status && TERMINAL_STATUSES.has(status));
}

export function useAutoForge() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastBuild, setLastBuild] = useState<BuildResponse | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', content: 'Welcome to AutoForge. Describe what you want to build.' },
  ]);

  const pollingRef = useRef<number | null>(null);
  const streamRef = useRef<EventSource | null>(null);
  const terminalNotifiedRef = useRef(false);

  // Restore session on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('autoforge_session_id');
    const savedLastBuild = localStorage.getItem('autoforge_last_build');
    if (savedSessionId) setSessionId(savedSessionId);
    if (savedLastBuild) {
      try {
        const build = JSON.parse(savedLastBuild) as BuildResponse;
        setLastBuild(build);
      } catch (error) {
        console.error('Failed to restore saved build from localStorage:', error);
      }
    }
  }, []);

  // Save session when it updates
  useEffect(() => {
    if (sessionId) localStorage.setItem('autoforge_session_id', sessionId);
    if (lastBuild) localStorage.setItem('autoforge_last_build', JSON.stringify(lastBuild));
  }, [sessionId, lastBuild]);

  const stopStreaming = () => {
    if (streamRef.current) {
      streamRef.current.close();
      streamRef.current = null;
    }
  };

  // Polling logic
  const startPolling = (sid: string) => {
    if (pollingRef.current) window.clearInterval(pollingRef.current);
    
    pollingRef.current = window.setInterval(async () => {
      try {
        const build = await getSession(sid);
        if (build) {
          setLastBuild(build);
          if (isTerminalStatus(build.status) && !terminalNotifiedRef.current) {
            terminalNotifiedRef.current = true;
            stopPolling();
            stopStreaming();
            setIsTyping(false);
            setMessages(prev => [
              ...prev,
              {
                role: 'agent',
                content: build.status === 'success' ? 'Build completed successfully.' : 'Build finished with errors.',
                files: build.files,
                output: build.output,
                success: build.success,
              }
            ]);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
        stopPolling();
        setIsTyping(false);
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleBuildUpdate = (build: BuildResponse) => {
    setLastBuild(build);

    if (isTerminalStatus(build.status) && !terminalNotifiedRef.current) {
      terminalNotifiedRef.current = true;
      stopPolling();
      stopStreaming();
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'agent',
          content: build.status === 'success' ? 'Build completed successfully.' : 'Build finished with errors.',
          files: build.files,
          output: build.output,
          success: build.success,
        }
      ]);
    }
  };

  const startStreaming = (sid: string) => {
    stopStreaming();
    streamRef.current = streamSession(
      sid,
      (build) => {
        handleBuildUpdate(build);
      },
      () => {
        stopStreaming();
        if (!terminalNotifiedRef.current) {
          startPolling(sid);
        }
      }
    );
  };

  useEffect(() => {
    if (!sessionId || !lastBuild) return;
    if (isTerminalStatus(lastBuild.status)) return;
    if (streamRef.current) return;
    setIsTyping(true);
    terminalNotifiedRef.current = false;
    startStreaming(sessionId);
  }, [sessionId, lastBuild]);

  useEffect(() => {
    return () => {
      stopPolling();
      stopStreaming();
    };
  }, []);

  const currentFiles = useMemo(() => lastBuild?.files ?? {}, [lastBuild]);

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
    setIsTyping(true);
    terminalNotifiedRef.current = false;
    stopPolling();
    stopStreaming();

    try {
      const response = sessionId 
        ? await modifyProject(sessionId, prompt)
        : await buildProject(prompt);

      setSessionId(response.session_id);
      handleBuildUpdate(response);

      if (!isTerminalStatus(response.status)) {
        startStreaming(response.session_id);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Request failed.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: errorMsg,
          success: false,
        },
      ]);
      setIsTyping(false);
      stopPolling();
      stopStreaming();
      throw error;
    }
  };

  const resetSession = () => {
    localStorage.removeItem('autoforge_session_id');
    localStorage.removeItem('autoforge_last_build');
    window.location.reload();
  };

  return {
    sessionId,
    lastBuild,
    isTyping,
    messages,
    currentFiles,
    sendMessage,
    resetSession,
  };
}
