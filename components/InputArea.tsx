/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ArrowUpTrayIcon, PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  onGenerate: (prompt: string, file?: File) => void;
  isGenerating: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 52), 160);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!prompt.trim() && !selectedFile) || isGenerating) return;
    onGenerate(prompt, selectedFile || undefined);
    setPrompt('');
    setSelectedFile(null);
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isGenerating) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, [isGenerating]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div 
        className={`
          relative bg-zinc-900/60 backdrop-blur-2xl border-2 rounded-3xl transition-all duration-300 group shadow-lg
          ${isDragging ? 'border-blue-500 bg-zinc-900 scale-[1.02] shadow-blue-500/20' : isFocused ? 'border-zinc-700 shadow-zinc-900/50' : 'border-zinc-800/60 hover:border-zinc-700'}
          ${isGenerating ? 'opacity-70 pointer-events-none grayscale' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <form onSubmit={handleSubmit} className="p-2.5">
          {/* File Preview */}
          {selectedFile && (
            <div className="flex items-center justify-between bg-zinc-800/80 rounded-xl px-4 py-3 mb-2 mx-1 animate-in fade-in slide-in-from-bottom-2 border border-zinc-700/50">
                <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                        <PhotoIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    </div>
                    <span className="text-sm text-zinc-200 truncate font-medium">{selectedFile.name}</span>
                </div>
                <button 
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-zinc-500 hover:text-zinc-200 p-1.5 hover:bg-zinc-700/50 rounded-lg transition-colors"
                >
                    &times;
                </button>
            </div>
          )}

          <div className="flex items-end gap-3">
            <div className="flex-1 relative min-w-0 pl-2">
                <textarea
                    ref={textareaRef}
                    value={prompt}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={selectedFile ? "Add your thoughts..." : "Paste a review or drag an image here..."}
                    className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm md:text-base px-2 py-3.5 focus:outline-none resize-none overflow-y-auto custom-scrollbar min-h-[52px]"
                    rows={1}
                    style={{ maxHeight: '160px' }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                />
            </div>

            <div className="flex items-center space-x-2 pb-2 pr-2 flex-shrink-0">
                <label className="p-2.5 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl cursor-pointer transition-all active:scale-90" title="Upload Image">
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
                <button 
                    type="submit"
                    disabled={(!prompt.trim() && !selectedFile) || isGenerating}
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-95 hover:-translate-y-0.5"
                >
                    {isGenerating ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <PaperAirplaneIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
          </div>
        </form>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #52525b;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #71717a;
        }
      `}</style>
    </div>
  );
};