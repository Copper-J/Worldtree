/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../services/gemini';
import { XMarkIcon, CheckIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface EditModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: MediaItem) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ item, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(item);
  }, [item]);

  if (!isOpen || !formData) return null;

  const handleChange = (field: keyof MediaItem, value: any) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(t => t.trim()); 
    setFormData(prev => prev ? ({ ...prev, tags }) : null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => prev ? ({ ...prev, coverImage: reader.result as string }) : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <h3 className="text-lg font-bold text-white">
            {formData.title ? '编辑记录 (Edit Entry)' : '添加新记录 (New Entry)'}
          </h3>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Cover Image Section */}
            <div className="shrink-0">
                <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">封面 (Cover)</label>
                <div 
                    onClick={triggerImageUpload}
                    className={`w-32 h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${
                        formData.coverImage 
                        ? 'border-zinc-700 bg-black' 
                        : 'border-zinc-700 hover:border-blue-500 hover:bg-zinc-800/50'
                    }`}
                >
                    {formData.coverImage ? (
                        <>
                            <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-white font-medium">Change</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-2">
                            <PhotoIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                            <span className="text-xs text-zinc-500">Click to upload</span>
                        </div>
                    )}
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                    />
                </div>
                {formData.coverImage && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleChange('coverImage', undefined); }}
                        className="mt-2 text-xs text-red-400 hover:text-red-300 w-full text-center"
                    >
                        Remove Cover
                    </button>
                )}
            </div>

            {/* Main Details Section */}
            <div className="flex-1 space-y-5">
                 {/* Title */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">标题 (Title)</label>
                    <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter title..."
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Type */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">种类 (Category)</label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        >
                            <option value="Movie">电影 (Movie)</option>
                            <option value="TV">剧集 (TV)</option>
                            <option value="Book">书籍 (Book)</option>
                            <option value="Music">音乐 (Music)</option>
                        </select>
                    </div>
                    
                    {/* Date */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">日期 (Date)</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                 {/* Rating */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">评分 (Rating)</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => handleChange('rating', star)}
                                className="p-1 focus:outline-none group"
                            >
                                <StarIcon 
                                    className={`w-6 h-6 transition-colors ${
                                        star <= formData.rating ? 'text-yellow-500' : 'text-zinc-700 group-hover:text-yellow-500/50'
                                    }`} 
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          {/* Thoughts */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">感想 (Thoughts)</label>
            <textarea
              value={formData.thoughts}
              onChange={(e) => handleChange('thoughts', e.target.value)}
              rows={6}
              placeholder="How did this make you feel?"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
            />
          </div>

          {/* Tags */}
           <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">标签 (Tags - comma separated)</label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500"
              placeholder="Sci-Fi, Drama, Classic"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={() => {
                    const cleanedTags = formData.tags.filter(t => t.trim().length > 0);
                    onSave({...formData, tags: cleanedTags});
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
            >
                <CheckIcon className="w-4 h-4" />
                Save
            </button>
        </div>
      </div>
    </div>
  );
};