
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PaperAirplaneIcon, TrashIcon, ChatBubbleLeftRightIcon, ChevronDownIcon, ChevronUpIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  text: string;
  timestamp: string; // ISO string
}

type ViewMode = 'collapsed' | 'expanded' | 'fullscreen';

export const Guestbook: React.FC = () => {
  // Lazy init to safely read localStorage before rendering
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('guestbook_messages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse guestbook", e);
      return [];
    }
  });

  const [inputText, setInputText] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('collapsed');

  // Save messages to local storage
  useEffect(() => {
    localStorage.setItem('guestbook_messages', JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [newMessage, ...prev]);
    setInputText('');
  };

  const handleDelete = (id: string) => {
      setMessages(prev => prev.filter(m => m.id !== id));
  }

  // Collapsed View
  if (viewMode === 'collapsed') {
    return (
        <button 
            onClick={() => setViewMode('expanded')}
            className="w-full bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/60 rounded-2xl p-4 backdrop-blur-md shadow-lg flex items-center justify-between text-zinc-400 hover:text-zinc-200 transition-all group animate-in fade-in slide-in-from-top-2 duration-500"
        >
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-zinc-800/50 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="font-medium text-sm tracking-tight">留言板 (Guestbook)</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
                {messages.length > 0 && (
                    <span className="bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        {messages.length}
                    </span>
                )}
                <ChevronDownIcon className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
            </div>
        </button>
    );
  }

  const isFullscreen = viewMode === 'fullscreen';

  // The content of the guestbook (shared between Expanded and Fullscreen)
  const GuestbookContent = (
    <div className={`
        flex flex-col border border-zinc-800/60 shadow-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isFullscreen 
            ? 'fixed inset-4 md:inset-10 lg:inset-20 z-[100] rounded-3xl bg-zinc-950/95 backdrop-blur-2xl shadow-black/80' 
            : 'w-full h-[400px] rounded-3xl relative z-20 bg-zinc-900/80 backdrop-blur-xl shadow-black/50' // Relative for normal flow
        }
    `}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50 bg-zinc-950/30 shrink-0">
            <div className="flex items-center space-x-3 text-zinc-100">
                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-bold tracking-tight">留言板 (Guestbook)</h3>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setViewMode(isFullscreen ? 'expanded' : 'fullscreen')}
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors active:scale-95"
                    title={isFullscreen ? "Minimize" : "Maximize"}
                >
                    {isFullscreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                </button>
                <button 
                    onClick={() => setViewMode('collapsed')}
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors active:scale-95"
                    title="Collapse"
                >
                    <ChevronUpIcon className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col min-h-0 p-5">
            
            {/* Input Form */}
            <form onSubmit={handleSubmit} className={`relative group shrink-0 ${isFullscreen ? 'mb-8 max-w-2xl mx-auto w-full' : 'mb-4'}`}>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Leave a note..."
                    className={`w-full bg-zinc-950/50 border border-zinc-800 focus:border-blue-500/50 rounded-2xl p-4 pr-12 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all resize-none custom-scrollbar shadow-inner ${isFullscreen ? 'h-24 text-base' : 'h-16'}`}
                />
                <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className="absolute bottom-3 right-3 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95"
                >
                    <PaperAirplaneIcon className={`w-4 h-4 ${isFullscreen ? 'w-5 h-5' : ''}`} />
                </button>
            </form>

            {/* Messages List Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                    {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-2">
                        <div className="p-3 bg-zinc-800/50 rounded-full">
                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-zinc-600" />
                        </div>
                        <p className="text-zinc-500 text-sm">No messages yet.<br/>Be the first to say hi! 👋</p>
                    </div>
                ) : (
                    <div className={`${isFullscreen ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}`}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`group relative bg-zinc-800/30 hover:bg-zinc-800/60 rounded-xl border border-zinc-700/30 hover:border-zinc-600/50 transition-all hover:shadow-lg shadow-sm flex flex-col ${isFullscreen ? 'p-5' : 'p-3 animate-message-pop'}`}>
                                <p className={`text-zinc-300 whitespace-pre-wrap leading-relaxed break-words flex-1 ${isFullscreen ? 'text-sm' : 'text-xs'}`}>{msg.text}</p>
                                
                                <div className="flex justify-between items-end mt-3 pt-2 border-t border-zinc-800/30">
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                        {new Date(msg.timestamp).toLocaleString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric'
                                        })}
                                    </span>
                                    <button 
                                        onClick={() => handleDelete(msg.id)}
                                        className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-500/10 rounded-md active:scale-90"
                                        title="Delete message"
                                    >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <style>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: #3f3f46;
                border-radius: 20px;
            }
            @keyframes messagePop {
                0% { opacity: 0; transform: scale(0.9) translateY(10px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-message-pop {
                animation: messagePop 0.4s ease-out forwards;
            }
        `}</style>
    </div>
  );

  if (isFullscreen) {
    return (
        <>
            {/* Placeholder to keep layout stable while content is portal'd out */}
            <div className="w-full h-[400px] opacity-0 pointer-events-none" aria-hidden="true" />
            
            {createPortal(
                <>
                    <div 
                        className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
                        onClick={() => setViewMode('expanded')}
                    />
                    {GuestbookContent}
                </>,
                document.body
            )}
        </>
    );
  }

  return GuestbookContent;
};
