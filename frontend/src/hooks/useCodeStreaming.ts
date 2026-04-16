import { useEffect, useMemo, useRef, useState } from 'react';

const TERMINAL_STATUSES = new Set(['success', 'failed']);
const CHARS_PER_TICK = 80;
const TICK_MS = 18;

interface UseCodeStreamingOptions {
  files: Record<string, string>;
  isTyping: boolean;
  status?: string;
}

export function useCodeStreaming({ files, isTyping, status }: UseCodeStreamingOptions) {
  const [streamedFiles, setStreamedFiles] = useState<Record<string, string>>({});
  const intervalRef = useRef<number | null>(null);
  const stepRef = useRef<{ fileIndex: number; offset: number }>({ fileIndex: 0, offset: 0 });
  const previousSignatureRef = useRef('');

  const fileKeys = useMemo(() => Object.keys(files), [files]);
  const signature = useMemo(
    () => fileKeys.map((key) => `${key}:${files[key]?.length ?? 0}`).join('|'),
    [fileKeys, files]
  );

  const isStreaming = Boolean(
    isTyping &&
      status &&
      !TERMINAL_STATUSES.has(status) &&
      fileKeys.length > 0
  );

  const stop = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!isStreaming) {
      stop();
      setStreamedFiles(files);
      previousSignatureRef.current = signature;
      return;
    }

    const signatureChanged = previousSignatureRef.current !== signature;
    if (signatureChanged) {
      stepRef.current = { fileIndex: 0, offset: 0 };
      setStreamedFiles({});
      previousSignatureRef.current = signature;
    }

    stop();
    intervalRef.current = window.setInterval(() => {
      setStreamedFiles((prev) => {
        const next = { ...prev };
        let fileIndex = stepRef.current.fileIndex;
        let offset = stepRef.current.offset;

        if (fileIndex >= fileKeys.length) {
          stop();
          return files;
        }

        const filePath = fileKeys[fileIndex];
        const fullContent = files[filePath] ?? '';
        const currentContent = next[filePath] ?? '';

        const start = Math.max(offset, currentContent.length);
        const end = Math.min(start + CHARS_PER_TICK, fullContent.length);
        next[filePath] = fullContent.slice(0, end);

        if (end >= fullContent.length) {
          fileIndex += 1;
          offset = 0;
        } else {
          offset = end;
        }

        stepRef.current = { fileIndex, offset };
        return next;
      });
    }, TICK_MS);

    return () => stop();
  }, [files, fileKeys, isStreaming, signature]);

  useEffect(() => {
    return () => stop();
  }, []);

  return {
    files: streamedFiles,
    isStreaming,
  };
}
