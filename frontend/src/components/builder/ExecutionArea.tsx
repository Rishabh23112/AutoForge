import React, { useMemo, useState } from 'react';
import { Activity, Check, CheckCircle2, Copy, Terminal } from 'lucide-react';
import { BuildResponse } from '../../types';

interface ExecutionAreaProps {
  files: Record<string, string>;
  activeFile: string;
  lastBuild: BuildResponse | null;
  isStreamingCode?: boolean;
}

const HTTP_LIKE_PATTERN = /^(https?:|data:|javascript:|#)/i;

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\.\//, '').trim();
}

function dirname(path: string): string {
  const normalized = normalizePath(path);
  const separatorIndex = normalized.lastIndexOf('/');
  if (separatorIndex === -1) return '';
  return normalized.slice(0, separatorIndex);
}

function resolveRelativePath(baseFile: string, targetPath: string): string {
  const normalizedTarget = normalizePath(targetPath).replace(/^\//, '');
  const baseParts = dirname(baseFile).split('/').filter(Boolean);
  const targetParts = normalizedTarget.split('/').filter(Boolean);

  for (const part of targetParts) {
    if (part === '.') continue;
    if (part === '..') {
      baseParts.pop();
      continue;
    }
    baseParts.push(part);
  }

  return baseParts.join('/');
}

function findAssetContent(files: Record<string, string>, htmlFile: string, reference: string): string | null {
  if (!reference || HTTP_LIKE_PATTERN.test(reference)) {
    return null;
  }

  const strippedReference = reference.split('?')[0]?.split('#')[0] ?? '';
  if (!strippedReference) return null;

  const normalizedReference = normalizePath(strippedReference);
  const normalizedKeys = Object.keys(files).map((key) => ({
    raw: key,
    normalized: normalizePath(key),
  }));

  const exact = normalizedKeys.find((entry) => entry.normalized === normalizedReference);
  if (exact) return files[exact.raw];

  const resolved = resolveRelativePath(htmlFile, normalizedReference);
  const resolvedMatch = normalizedKeys.find((entry) => entry.normalized === resolved);
  if (resolvedMatch) return files[resolvedMatch.raw];

  const filename = normalizedReference.split('/').pop();
  if (!filename) return null;

  const byFilename = normalizedKeys.find((entry) => entry.normalized.split('/').pop() === filename);
  return byFilename ? files[byFilename.raw] : null;
}

function buildPreviewDocument(files: Record<string, string>, htmlFile: string): string {
  const rawHtml = files[htmlFile];
  if (!rawHtml) return '';

  let hydratedHtml = rawHtml;

  hydratedHtml = hydratedHtml.replace(/<link\b([^>]*?)>/gi, (fullTag, attributes) => {
    if (!/\brel\s*=\s*["'][^"']*stylesheet[^"']*["']/i.test(attributes)) {
      return fullTag;
    }

    const hrefMatch = attributes.match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (!hrefMatch) return fullTag;

    const cssContent = findAssetContent(files, htmlFile, hrefMatch[1]);
    if (!cssContent) return fullTag;

    return `<style data-inline-source="${hrefMatch[1]}">\n${cssContent}\n</style>`;
  });

  hydratedHtml = hydratedHtml.replace(/<script\b([^>]*?)>\s*<\/script>/gi, (fullTag, attributes) => {
    const srcMatch = attributes.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (!srcMatch) return fullTag;

    const scriptContent = findAssetContent(files, htmlFile, srcMatch[1]);
    if (!scriptContent) return fullTag;

    const attributesWithoutSrc = attributes.replace(/\s*\bsrc\s*=\s*["'][^"']+["']/i, '');
    return `<script${attributesWithoutSrc}>\n${scriptContent}\n</script>`;
  });

  return hydratedHtml;
}

export const ExecutionArea = ({ files, activeFile, lastBuild, isStreamingCode = false }: ExecutionAreaProps) => {
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'evaluation'>('code');
  const [isCopied, setIsCopied] = useState(false);

  const codeToShow = files[activeFile] ?? '';
  const htmlPreviewFile = useMemo(() => {
    const allFiles = Object.keys(files);
    const indexHtml = allFiles.find((file) => /(^|\/)index\.html$/i.test(normalizePath(file)));
    if (indexHtml) return indexHtml;
    return allFiles.find((file) => file.toLowerCase().endsWith('.html')) ?? null;
  }, [files]);

  const htmlPreviewContent = useMemo(() => {
    if (!htmlPreviewFile) return '';
    return buildPreviewDocument(files, htmlPreviewFile);
  }, [files, htmlPreviewFile]);

  const pipelineStatus = useMemo(() => {
    if (!lastBuild) return { label: 'IDLE', className: 'text-gray-400' };
    if (lastBuild.status === 'success') return { label: 'SUCCESS', className: 'text-[#00ff66]' };
    if (lastBuild.status === 'failed') return { label: 'FAILED', className: 'text-red-400' };
    return { label: 'RUNNING', className: 'text-yellow-300' };
  }, [lastBuild]);

  const handleCopy = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505]">
      <div className="h-12 border-b border-white/10 flex items-center px-4 gap-6 bg-[#0a0a0a]">
        <button onClick={() => setActiveTab('code')} className={`h-full border-b-2 text-sm font-medium px-2 ${activeTab === 'code' ? 'border-[#00ff66] text-[#00ff66]' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Code</button>
        <button onClick={() => setActiveTab('preview')} className={`h-full border-b-2 text-sm font-medium px-2 ${activeTab === 'preview' ? 'border-[#00ff66] text-[#00ff66]' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Preview</button>
        <button onClick={() => setActiveTab('evaluation')} className={`h-full border-b-2 text-sm font-medium px-2 ${activeTab === 'evaluation' ? 'border-[#00ff66] text-[#00ff66]' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Evaluation</button>
      </div>

      <div className="flex-1 relative">
        {activeTab === 'code' ? (
          <div className="absolute inset-0 p-6 overflow-y-auto font-mono text-sm text-gray-300">
            {codeToShow ? (
              <div className="relative group">
                <button
                  onClick={() => handleCopy(codeToShow)}
                  className="absolute right-3 top-3 px-3 py-2 bg-[#0a0a0a] border border-white/10 hover:border-[#00ff66]/50 hover:text-[#00ff66] rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center gap-2 text-xs text-gray-400 backdrop-blur-md z-10"
                >
                  {isCopied ? <Check className="w-4 h-4 text-[#00ff66]" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? 'Copied!' : 'Copy Code'}
                </button>
                <pre className="whitespace-pre-wrap bg-[#111] p-4 rounded-xl border border-white/5">{codeToShow}</pre>
                {isStreamingCode && (
                  <div className="mt-3 text-xs text-[#00ff66] font-mono animate-pulse">
                    Streaming code generation...
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-600">
                Generate a project to inspect files.
              </div>
            )}
          </div>
        ) : activeTab === 'preview' ? (
          <div className="absolute inset-0 bg-[#050505]">
            {htmlPreviewContent ? (
              <div className="w-full h-full bg-white relative">
                <iframe title="preview" className="w-full h-full border-none" srcDoc={htmlPreviewContent} />
                <a 
                  href="http://localhost:8001" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 px-4 py-2 bg-[#00ff66] text-black text-sm font-bold rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  View on Port 8001
                </a>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-[#050505] px-6 text-center space-y-6">
                <div className="max-w-md">
                   <p className="mb-6">Pure HTML preview is unavailable for this project type (e.g., React or Python). If the backend pipeline is successful, you can access the live app below:</p>
                   <div className="flex flex-col gap-4">
                      <a 
                        href="http://localhost:3001" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-[#111] border border-[#00ff66]/30 text-[#00ff66] rounded-xl hover:bg-[#00ff66]/10 transition-colors flex items-center justify-center gap-3 font-mono"
                      >
                        <Terminal className="w-5 h-5" />
                        http://localhost:3001 (Node/React)
                      </a>
                      <a 
                        href="http://localhost:8001" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-[#111] border border-[#00ff66]/30 text-[#00ff66] rounded-xl hover:bg-[#00ff66]/10 transition-colors flex items-center justify-center gap-3 font-mono"
                      >
                        <Activity className="w-5 h-5" />
                        http://localhost:8001 (Python/Server)
                      </a>
                   </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 p-6 overflow-y-auto bg-[#050505] text-gray-300">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-display font-bold text-[#00ff66] mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Runtime Status
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass-panel p-4 rounded-xl border-white/10 bg-[#111]">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Pipeline Status</div>
                  <div className={`text-2xl font-mono ${pipelineStatus.className}`}>
                    {pipelineStatus.label}
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border-white/10 bg-[#111]">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Files Generated</div>
                  <div className="text-2xl font-mono text-[#00ff66]">{Object.keys(files).length}</div>
                </div>
              </div>
              {lastBuild?.evaluation && lastBuild.evaluation.length > 0 && (
                <div className="mb-8 rounded-xl border border-white/10 bg-[#111] p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-white font-medium">Code Evaluation</div>
                    <div className="text-sm text-[#00ff66] font-mono">
                      Score: {lastBuild.evaluation_score ?? 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {lastBuild.evaluation.map((item) => (
                      <div key={item.file_path} className="rounded-lg border border-white/10 bg-black/20 p-3">
                        <div className="text-xs text-gray-400 mb-1">{item.file_path}</div>
                        <div className="text-sm text-[#00ff66] font-mono mb-2">Score: {item.score}/10</div>
                        <div className="text-xs text-gray-300 whitespace-pre-wrap">{item.feedback}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 items-start p-3 rounded-lg bg-white/5 border border-white/5">
                <CheckCircle2
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    pipelineStatus.label === 'SUCCESS'
                      ? 'text-[#00ff66]'
                      : pipelineStatus.label === 'FAILED'
                        ? 'text-red-400'
                        : 'text-yellow-300'
                  }`}
                />
                <div>
                  <div className="text-sm text-white font-medium">Backend execution output</div>
                  <pre className="text-xs text-gray-400 mt-1 whitespace-pre-wrap break-words">{lastBuild?.output ?? 'No backend output yet.'}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
