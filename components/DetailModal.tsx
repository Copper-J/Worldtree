
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { MediaItem } from '../services/gemini';
import { XMarkIcon, PencilSquareIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import { StarIcon, FilmIcon, TvIcon, BookOpenIcon, MusicalNoteIcon } from '@heroicons/react/24/solid';

interface DetailModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: MediaItem) => void;
}

const TYPE_ICONS = {
  'Movie': FilmIcon,
  'TV': TvIcon,
  'Book': BookOpenIcon,
  'Music': MusicalNoteIcon,
};

const TYPE_COLORS = {
  'Movie': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'TV': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Book': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'Music': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
};

export const DetailModal: React.FC<DetailModalProps> = ({ item, isOpen, onClose, onEdit }) => {
  if (!isOpen || !item) return null;

  const Icon = TYPE_ICONS[item.type];
  const typeStyle = TYPE_COLORS[item.type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* 1. Backdrop with Blurred Image */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        {item.coverImage ? (
            <div 
                className="absolute inset-0 opacity-20 blur-sm scale-105 transition-transform duration-1000"
                style={{ 
                    backgroundImage: `url(${item.coverImage})`, 
                    backgroundPosition: 'center', 
                    backgroundSize: 'cover' 
                }}
            />
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-50" />
        )}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* 2. Modal Content */}
      <div className="relative z-10 bg-zinc-900/80 border border-white/10 shadow-2xl rounded-3xl w-full max-w-5xl h-[85vh] md:h-[80vh] overflow-hidden flex flex-col md:flex-row backdrop-blur-xl animate-in zoom-in-95 duration-300">
        
        {/* Close Button (Floating) */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-110 active:scale-95"
        >
            <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Left Side: Large Cover */}
        <div className="w-full md:w-5/12 h-64 md:h-full bg-black/50 relative shrink-0">
            {item.coverImage ? (
                <img 
                    src={item.coverImage} 
                    alt={item.title} 
                    className="w-full h-full object-contain md:object-cover bg-black/20"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <Icon className="w-24 h-24 text-zinc-600 opacity-50" />
                </div>
            )}
            
            {/* Type Badge Overlay */}
            <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full backdrop-blur-md border flex items-center gap-2 ${typeStyle}`}>
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{item.type}</span>
            </div>
        </div>

        {/* Right Side: Details Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-gradient-to-b from-transparent to-black/20">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">{item.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-zinc-400">
                    <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-sm font-mono">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/20 text-yellow-500">
                        <StarIcon className="w-4 h-4" />
                        <span className="text-sm font-bold">{item.rating}/5</span>
                    </div>
                </div>
            </div>

            {/* Content Blocks */}
            <div className="space-y-8">
                
                {/* Thoughts Section */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:bg-white/10 transition-colors">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                        My Thoughts
                    </h3>
                    <p className="text-lg text-zinc-200 leading-relaxed whitespace-pre-wrap font-light">
                        {item.thoughts}
                    </p>
                </div>

                {/* Summary Section if exists */}
                {item.summary && (
                    <div>
                         <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Summary</h3>
                         <p className="text-zinc-400 italic border-l-2 border-zinc-700 pl-4 py-1">
                            {item.summary}
                         </p>
                    </div>
                )}

                {/* Tags */}
                <div>
                     <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Tags</h3>
                     <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, i) => (
                            <span key={i} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-500 transition-colors">
                                <TagIcon className="w-3 h-3 opacity-50" />
                                {tag}
                            </span>
                        ))}
                     </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-12 pt-6 border-t border-white/10 flex justify-end">
                <button
                    onClick={() => onEdit(item)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
                >
                    <PencilSquareIcon className="w-5 h-5" />
                    Edit Entry
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
