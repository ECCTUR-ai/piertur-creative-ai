'use client';

import React, { useState } from 'react';
import { Film, Play, X, Sparkles, Clock, Layers } from 'lucide-react';

interface VideoMotionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoMotionModal: React.FC<VideoMotionModalProps> = ({ isOpen, onClose }) => {
  const [duration, setDuration] = useState<number>(10);
  const [style, setStyle] = useState<string>('Dynamic');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [noticeVisible, setNoticeVisible] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setNoticeVisible(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-8 text-white relative shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B63CE] to-[#E31C24] flex items-center justify-center shadow-lg">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Tasarımı Hareketlendir</h2>
            <p className="text-xs text-slate-400">
              Sosyal medya reklamınızı MP4 animasyon videosuna dönüştürün.
            </p>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FFB21C]" />
            <span>Video Süresi</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[8, 10, 15].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setDuration(sec)}
                className={`py-3 rounded-xl text-xs font-extrabold border transition-all ${
                  duration === sec
                    ? 'bg-[#0B63CE] border-[#0B63CE] text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {sec} saniye
              </button>
            ))}
          </div>
        </div>

        {/* Animation Style */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#FFB21C]" />
            <span>Animation Style</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Smooth', name: 'Smooth' },
              { id: 'Dynamic', name: 'Dynamic' },
              { id: 'Premium', name: 'Premium' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStyle(st.id)}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                  style === st.id
                    ? 'bg-[#082E63] border-[#FFB21C] text-[#FFB21C] shadow-md ring-2 ring-amber-400/20'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>

        {/* Future Phase Notice */}
        {noticeVisible && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFB21C] shrink-0" />
            <span>Video üretimi bir sonraki fazda aktif olacaktır. (Remotion Engine)</span>
          </div>
        )}

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-[#0B63CE] to-[#E31C24] hover:brightness-110 text-white py-4 rounded-xl font-extrabold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all"
        >
          {isGenerating ? (
            <span>Animasyon Hazırlanıyor...</span>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Video Oluştur</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
