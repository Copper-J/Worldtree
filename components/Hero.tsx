
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { BookOpenIcon, FilmIcon, MusicalNoteIcon, TvIcon } from '@heroicons/react/24/outline';

export const Hero: React.FC = () => {
  return (
    <div className="text-center relative z-10 max-w-4xl mx-auto px-4 py-4">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed-1 {
          animation: float 6s ease-in-out 1.5s infinite;
        }
        .animate-float-delayed-2 {
          animation: float 6s ease-in-out 3s infinite;
        }
        .animate-float-delayed-3 {
            animation: float 6s ease-in-out 4.5s infinite;
        }
      `}</style>
      <div className="flex justify-center space-x-6 mb-6 opacity-70">
        <FilmIcon className="w-8 h-8 text-blue-400 animate-float drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        <TvIcon className="w-8 h-8 text-purple-400 animate-float-delayed-1 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
        <BookOpenIcon className="w-8 h-8 text-amber-400 animate-float-delayed-2 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
        <MusicalNoteIcon className="w-8 h-8 text-emerald-400 animate-float-delayed-3 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
      </div>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 drop-shadow-sm">
        Cultural <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Footprint</span>
      </h1>
      <p className="text-zinc-400 text-sm md:text-lg max-w-xl mx-auto font-light leading-relaxed">
        Record your journey through films, books, and music. <br className="hidden md:block"/> Upload a cover or write a note, and let AI organize your memories.
      </p>
    </div>
  );
};
