import React from 'react';
import { FileCode2 } from 'lucide-react';

interface FileExplorerProps {
  files: Record<string, string>;
  activeFile: string;
  onFileSelect: (fileName: string) => void;
}

export const FileExplorer = ({ files, activeFile, onFileSelect }: FileExplorerProps) => {
  return (
    <div className="w-56 border-r border-white/10 p-4 hidden md:block overflow-y-auto">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-4 font-semibold">Files</div>
      <div className="space-y-2">
        {Object.keys(files).map((file) => (
          <div
            key={file}
            onClick={() => onFileSelect(file)}
            className={`flex items-center gap-2 text-sm cursor-pointer transition-colors ${activeFile === file ? 'text-[#00ff66]' : 'text-gray-400 hover:text-[#00ff66]'}`}
          >
            <FileCode2 className="w-4 h-4" /> {file}
          </div>
        ))}
      </div>
    </div>
  );
};
