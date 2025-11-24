
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { EditModal } from './components/EditModal';
import { DetailModal } from './components/DetailModal';
import { Guestbook } from './components/Guestbook';
import { parseMediaEntry, MediaItem } from './services/gemini';
import { FilmIcon, TvIcon, BookOpenIcon, MusicalNoteIcon, Squares2X2Icon, ListBulletIcon, StarIcon, PlusIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/solid';
import { CalendarIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

// Define icons mapping
const TYPE_ICONS = {
  'Movie': FilmIcon,
  'TV': TvIcon,
  'Book': BookOpenIcon,
  'Music': MusicalNoteIcon,
};

// More vibrant, "neon-glass" style colors
const TYPE_COLORS = {
  'Movie': 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)]',
  'TV': 'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)]',
  'Book': 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]',
  'Music': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]',
};

const TYPE_LABELS = {
  'Movie': '电影',
  'TV': '剧集',
  'Book': '书籍',
  'Music': '音乐'
};

type TimelineScale = 'detail' | 'month' | 'year';
type ScaleDirection = 'zoomOut' | 'zoomIn';

const App: React.FC = () => {
  // Lazy initialization for persistent state
  const [entries, setEntries] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('media_tracker_entries');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration: Assign IDs if they don't exist
        return parsed.map((item: any) => ({
          ...item,
          id: item.id || crypto.randomUUID()
        }));
      }
    } catch (e) {
      console.error("Failed to parse saved entries", e);
    }
    // Default sample data
    return [
      {
        id: "1",
        title: "Inception",
        type: "Movie",
        date: "2023-11-15",
        thoughts: "Absolutely mind-bending visual effects. The ending still haunts me.",
        tags: ["Sci-Fi", "Thriller"],
        rating: 5,
        summary: "A thief who steals corporate secrets through the use of dream-sharing technology."
      },
      {
        id: "2",
        title: "The Three-Body Problem",
        type: "Book",
        date: "2023-12-01",
        thoughts: "The scale of imagination is terrifying. Makes you feel small in the universe.",
        tags: ["Sci-Fi", "Philosophy"],
        rating: 5,
        summary: "Nanotechnology researcher Wang Miao is taken into a secret joint operation center."
      }
    ];
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'category' | 'timeline'>('timeline');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Timeline Zoom State
  const [timelineScale, setTimelineScale] = useState<TimelineScale>('detail');
  const [scaleDirection, setScaleDirection] = useState<ScaleDirection>('zoomOut');

  // Modal States
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [viewingItem, setViewingItem] = useState<MediaItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Save to local storage whenever entries change
  useEffect(() => {
    localStorage.setItem('media_tracker_entries', JSON.stringify(entries));
  }, [entries]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });
  };

  const handleGenerate = async (prompt: string, file?: File) => {
    setIsGenerating(true);
    try {
      let base64 = undefined;
      let mimeType = undefined;
      if (file) {
        base64 = await fileToBase64(file);
        mimeType = file.type;
      }

      const newItem = await parseMediaEntry(prompt, base64, mimeType);
      const newItemWithId = { ...newItem, id: crypto.randomUUID() };
      setEntries(prev => [newItemWithId, ...prev]);
    } catch (e) {
      console.error(e);
      alert("Could not analyze entry automatically. You can add it manually using the '+' button.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenManualAdd = () => {
    const newEntry: MediaItem = {
        id: crypto.randomUUID(),
        title: '',
        type: 'Movie',
        date: new Date().toISOString().split('T')[0],
        thoughts: '',
        tags: [],
        rating: 3,
        summary: ''
    };
    setEditingItem(newEntry);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (item: MediaItem) => {
    // If detail modal is open, close it
    setIsDetailModalOpen(false);
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleOpenDetail = (item: MediaItem) => {
    setViewingItem(item);
    setIsDetailModalOpen(true);
  };

  const handleSaveEntry = (savedItem: MediaItem) => {
    setEntries(prev => {
        const exists = prev.some(e => e.id === savedItem.id);
        if (exists) {
            return prev.map(item => item.id === savedItem.id ? savedItem : item);
        } else {
            return [savedItem, ...prev];
        }
    });
    setIsEditModalOpen(false);
    setEditingItem(null);
    // Re-open detail view if it was an edit of an existing item
    if (viewingItem && viewingItem.id === savedItem.id) {
        setViewingItem(savedItem);
        setIsDetailModalOpen(true);
    }
  };

  const handleTimelineScale = () => {
    if (timelineScale === 'detail') {
        setTimelineScale('month');
        setScaleDirection('zoomOut');
    } else if (timelineScale === 'month') {
        if (scaleDirection === 'zoomOut') {
            setTimelineScale('year');
        } else {
            setTimelineScale('detail');
            setScaleDirection('zoomOut'); // Reset to default direction
        }
    } else if (timelineScale === 'year') {
        setTimelineScale('month');
        setScaleDirection('zoomIn');
    }
  };

  const filteredEntries = activeCategory === 'All' 
    ? entries 
    : entries.filter(e => e.type === activeCategory);

  // Sort by date for timeline
  const sortedEntries = [...filteredEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Grouping Logic for Month/Year views
  const groupedEntries = useMemo(() => {
    if (timelineScale === 'detail') return {};
    
    const groups: Record<string, MediaItem[]> = {};
    sortedEntries.forEach(entry => {
        const date = new Date(entry.date);
        let key = '';
        if (timelineScale === 'year') {
            key = isNaN(date.getTime()) ? 'Unknown' : date.getFullYear().toString();
        } else {
            // Month
            if (isNaN(date.getTime())) {
                key = 'Unknown';
            } else {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                key = `${year}-${month}`;
            }
        }
        if (!groups[key]) groups[key] = [];
        groups[key].push(entry);
    });
    return groups;
  }, [sortedEntries, timelineScale]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 pb-20 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950 pointer-events-none z-0" />
      
      <style>{`
        @keyframes timelineEnter {
            from {
                opacity: 0;
                transform: translateY(20px) scale(0.98);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        .animate-timeline-enter {
            animation: timelineEnter 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
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
      `}</style>

      <div className="relative z-10">
        
        {/* Header Section: Hero + Guestbook (Balanced 3-Column Layout) */}
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
            <div className="flex flex-col xl:flex-row items-center xl:items-start justify-between gap-8 xl:gap-8">
                
                {/* 1. Left Spacer (Hidden on mobile, matches Guestbook width for perfect centering) */}
                <div className="hidden xl:block w-80 shrink-0" aria-hidden="true" />

                {/* 2. Center Hero Area */}
                <div className="flex-1 w-full min-w-0 flex justify-center">
                    <div className="w-full max-w-4xl">
                        <Hero />
                    </div>
                </div>

                {/* 3. Right Guestbook */}
                <div className="w-full max-w-md xl:w-80 shrink-0 z-20 flex flex-col">
                    <Guestbook />
                </div>

            </div>
        </div>
        
        {/* Modals */}
        <EditModal 
            item={editingItem} 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            onSave={handleSaveEntry} 
        />

        <DetailModal 
            item={viewingItem}
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            onEdit={handleOpenEdit}
        />

        {/* Input & Controls Sticky Header */}
        <div className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 mb-8 transition-all duration-300 shadow-lg shadow-black/20">
            <div className="max-w-7xl mx-auto pt-4 pb-4">
                <div className="flex items-start gap-2 px-4 justify-center">
                    <div className="flex-1 max-w-2xl">
                        <InputArea onGenerate={handleGenerate} isGenerating={isGenerating} />
                    </div>
                    <button
                        onClick={handleOpenManualAdd}
                        className="mt-[9px] p-3 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 hover:border-zinc-500 text-white rounded-2xl transition-all flex-shrink-0 shadow-lg hover:shadow-blue-500/10 active:scale-95 duration-200"
                        title="Manual Add (Offline)"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-4 gap-4 max-w-4xl mx-auto">
                    
                    {/* Category Filter */}
                    <div className="flex p-1.5 bg-zinc-900/60 rounded-xl border border-zinc-800/60 overflow-x-auto max-w-full no-scrollbar shadow-inner">
                        {['All', 'Movie', 'TV', 'Book', 'Music'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap active:scale-95 duration-200 ${
                                    activeCategory === cat 
                                    ? 'bg-zinc-700 text-white shadow-md shadow-black/20' 
                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                }`}
                            >
                                {cat === 'All' ? '全部' : TYPE_LABELS[cat as keyof typeof TYPE_LABELS]}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        {/* View Toggle */}
                        <div className="flex bg-zinc-900/60 rounded-xl p-1.5 border border-zinc-800/60 shadow-inner">
                            <button 
                                onClick={() => setViewMode('category')}
                                className={`p-2 rounded-lg transition-all duration-200 active:scale-90 ${viewMode === 'category' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                title="Category Grid"
                            >
                                <Squares2X2Icon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setViewMode('timeline')}
                                className={`p-2 rounded-lg transition-all duration-200 active:scale-90 ${viewMode === 'timeline' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                title="Timeline"
                            >
                                <ListBulletIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Timeline Scale Toggle */}
                        {viewMode === 'timeline' && (
                            <button 
                                onClick={handleTimelineScale}
                                className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200 flex items-center justify-center min-w-[48px] active:scale-90 shadow-sm hover:shadow-md"
                                title={scaleDirection === 'zoomOut' ? "Collapse Items" : "Expand Items"}
                            >
                                {scaleDirection === 'zoomOut' ? (
                                    <ArrowsPointingInIcon className="w-5 h-5 animate-in fade-in zoom-in duration-300" />
                                ) : (
                                    <ArrowsPointingOutIcon className="w-5 h-5 animate-in fade-in zoom-in duration-300" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-4">
            
            {/* Main Content Area - Full Width */}
            <div className="w-full">
                {viewMode === 'category' ? (
                    /* Category Grid View - REDESIGNED: Cover above Title */
                    <div key="category-view" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-timeline-enter">
                        {sortedEntries.map((entry) => {
                            const Icon = TYPE_ICONS[entry.type];
                            const colorClass = TYPE_COLORS[entry.type];
                            return (
                                <div 
                                    key={entry.id} 
                                    onClick={() => handleOpenDetail(entry)}
                                    className="group bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/60 hover:border-zinc-700 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1.5 flex flex-col"
                                >
                                    {/* Large Top Cover Image */}
                                    <div className="w-full aspect-[2/3] relative overflow-hidden bg-black">
                                        {entry.coverImage ? (
                                            <img src={entry.coverImage} alt={entry.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-700">
                                                <Icon className="w-12 h-12 opacity-50 mb-2" />
                                                <span className="text-xs uppercase font-bold tracking-widest opacity-50">No Cover</span>
                                            </div>
                                        )}
                                        
                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                                        {/* Type Icon (Top Right) */}
                                        <div className={`absolute top-2 right-2 p-1.5 rounded-lg border ${colorClass} bg-black/50 backdrop-blur-md`}>
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>

                                        {/* Rating (Bottom Left) */}
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20 backdrop-blur-sm">
                                            <StarIcon className="w-3 h-3 text-yellow-500" />
                                            <span className="text-xs font-bold text-yellow-500">{entry.rating}</span>
                                        </div>
                                    </div>

                                    {/* Content Below */}
                                    <div className="p-4 flex flex-col flex-1 relative">
                                        <h3 className="text-sm font-bold text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug mb-2 text-center">{entry.title}</h3>
                                        <div className="mt-auto pt-2 border-t border-zinc-800/50 flex justify-center items-center text-xs text-zinc-500 font-mono">
                                             <span>{entry.date}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Timeline View Container */
                    <div key={timelineScale} className="relative space-y-10 pl-8 md:pl-0 animate-timeline-enter">
                        {/* Vertical Line with Gradient */}
                        <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-zinc-800/80 to-transparent md:-ml-px"></div>

                        {timelineScale === 'detail' ? (
                            /* Detail Mode (Full Cards) */
                            sortedEntries.map((entry, idx) => {
                                const Icon = TYPE_ICONS[entry.type];
                                const isLeft = idx % 2 === 0;
                                
                                return (
                                    <div key={entry.id} className={`relative flex flex-col md:flex-row items-start ${isLeft ? 'md:flex-row-reverse' : ''} group`}>
                                        
                                        {/* Timeline Dot */}
                                        <div className="absolute left-0 md:left-1/2 w-16 flex justify-center md:-translate-x-1/2 z-20 pointer-events-none">
                                            <div className={`relative w-9 h-9 rounded-full border-[3px] border-zinc-950 flex items-center justify-center ${TYPE_COLORS[entry.type].split(' ')[0]} ${TYPE_COLORS[entry.type].split(' ')[3]} transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-black/50`}>
                                                <Icon className={`w-4 h-4 ${TYPE_COLORS[entry.type].split(' ')[1]}`} />
                                            </div>
                                        </div>

                                        {/* Spacer for Desktop alignment */}
                                        <div className="hidden md:block w-1/2" />

                                        {/* Content Card - Clickable */}
                                        <div className={`w-full md:w-[calc(50%-2.5rem)] pl-12 md:pl-0 ${isLeft ? 'md:pr-10 text-left md:text-right' : 'md:pl-10 text-left'}`}>
                                            <div 
                                                onClick={() => handleOpenDetail(entry)}
                                                className={`bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-2xl hover:bg-zinc-900/50 hover:border-zinc-700/70 transition-all duration-300 relative group-hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 flex gap-5 ${isLeft ? 'md:flex-row-reverse' : ''} backdrop-blur-md cursor-pointer`}
                                            >
                                                
                                                {/* Cover Image Timeline */}
                                                {entry.coverImage && (
                                                    <div className="hidden sm:block shrink-0 w-24 h-32 rounded-lg bg-black border border-zinc-800/50 overflow-hidden shadow-md group-hover:shadow-lg transition-all">
                                                        <img src={entry.coverImage} alt={entry.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    {/* Quick Edit (Hover only) */}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(entry); }}
                                                        className={`absolute top-4 ${isLeft ? 'left-4 md:left-4 md:right-auto' : 'right-4'} p-1.5 text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all z-20 opacity-0 group-hover:opacity-100 active:scale-90`}
                                                        title="Quick Edit"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" />
                                                    </button>

                                                    {/* Date Badge */}
                                                    <div className={`inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 mb-2 bg-zinc-800/30 px-2 py-0.5 rounded-md ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                                                        <CalendarIcon className="w-3 h-3" />
                                                        <span>{entry.date}</span>
                                                    </div>

                                                    <h3 className="text-xl font-bold text-zinc-100 mb-2 tracking-tight group-hover:text-blue-300 transition-colors">{entry.title}</h3>
                                                    
                                                    {/* Thoughts */}
                                                    <div className="relative">
                                                        <p className="text-sm text-zinc-400 leading-relaxed italic line-clamp-3">
                                                            "{entry.thoughts}"
                                                        </p>
                                                    </div>

                                                    {/* Tags & Rating */}
                                                    <div className={`mt-4 flex items-center gap-3 ${isLeft ? 'md:justify-end' : 'justify-start'}`}>
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <StarIcon key={i} className={`w-3.5 h-3.5 ${i < entry.rating ? 'text-yellow-500 drop-shadow-sm' : 'text-zinc-800'}`} />
                                                            ))}
                                                        </div>
                                                        <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                                                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{TYPE_LABELS[entry.type]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            /* Month/Year Mode (Grouped View) */
                            Object.keys(groupedEntries).sort((a,b) => b.localeCompare(a)).map((key, idx) => {
                                const groupItems = groupedEntries[key];
                                const isLeft = idx % 2 === 0;
                                // Format Label
                                const label = timelineScale === 'year' ? key : key.replace('-', ' / ');

                                return (
                                    <div key={key} className={`relative flex flex-col md:flex-row items-center ${isLeft ? 'md:flex-row-reverse' : ''} group`}>
                                        {/* Simple Dot */}
                                        <div className="absolute left-0 md:left-1/2 w-16 flex justify-center md:-translate-x-1/2 z-20">
                                            <div className="w-3 h-3 rounded-full bg-zinc-600 ring-4 ring-zinc-950 group-hover:bg-blue-400 group-hover:ring-blue-500/30 group-hover:scale-125 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                        </div>

                                        {/* Spacer */}
                                        <div className="hidden md:block w-1/2" />

                                        {/* Group Card */}
                                        <div className={`w-full md:w-[calc(50%-2.5rem)] pl-12 md:pl-0 ${isLeft ? 'md:pr-10' : 'md:pl-10'}`}>
                                            <div className="bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/60 hover:border-zinc-700/80 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group-hover:shadow-2xl group-hover:shadow-blue-900/10 group-hover:-translate-y-1">
                                                <div className="flex justify-between items-baseline mb-5 border-b border-zinc-800/50 pb-3">
                                                    <h3 className="text-2xl font-bold text-zinc-200 font-mono tracking-tighter group-hover:text-blue-300 transition-colors">{label}</h3>
                                                    <span className="text-xs font-mono text-zinc-400 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30">{groupItems.length} records</span>
                                                </div>
                                                
                                                {/* Grid of Mini Items */}
                                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                                    {groupItems.map(item => {
                                                        const Icon = TYPE_ICONS[item.type];
                                                        return (
                                                            <div 
                                                                key={item.id} 
                                                                onClick={() => handleOpenDetail(item)}
                                                                title={`${item.title} (${item.rating}★)`} 
                                                                className="aspect-[2/3] bg-zinc-950/50 rounded-xl border border-zinc-800/50 overflow-hidden relative group/item cursor-pointer hover:ring-2 ring-blue-500/50 hover:border-transparent transition-all shadow-sm hover:shadow-lg hover:-translate-y-1"
                                                            >
                                                                {item.coverImage ? (
                                                                    <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110 opacity-90 group-hover/item:opacity-100" />
                                                                ) : (
                                                                    <div className={`w-full h-full flex flex-col items-center justify-center gap-1 bg-zinc-900/80`}>
                                                                        <Icon className={`w-6 h-6 opacity-40 ${TYPE_COLORS[item.type].split(' ')[1]}`} />
                                                                    </div>
                                                                )}
                                                                {/* Mini Type Icon Overlay */}
                                                                <div className="absolute top-0 right-0 p-1.5 bg-gradient-to-bl from-black/80 to-transparent backdrop-blur-[1px]">
                                                                    <Icon className={`w-3 h-3 text-white/70 drop-shadow-md`} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {sortedEntries.length === 0 && (
                    <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                        <p className="text-zinc-500 text-lg">No memories yet. Click the + button to add one!</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default App;
