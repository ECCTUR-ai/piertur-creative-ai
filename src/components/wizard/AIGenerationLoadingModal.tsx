'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';

interface AIGenerationLoadingModalProps {
  isOpen: boolean;
}

const MESSAGES = [
  'Fotoğraf analiz ediliyor...',
  'Kampanya kompozisyonu hazırlanıyor...',
  'Fiyat vurgusu oluşturuluyor...',
  'Piertur marka dili uygulanıyor...',
  'Alternatif kreatifler hazırlanıyor...',
];

export const AIGenerationLoadingModal: React.FC<AIGenerationLoadingModalProps> = ({ isOpen }) => {
  const [msgIdx, setMsgIdx] = useState<number>(0);
  const [progress, setProgress] = useState<number>(10);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
      setProgress((prev) => (prev >= 90 ? 95 : prev + 18));
    }, 1800);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-blue-900/30 shadow-2xl text-center relative overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#082E63] via-[#0B63CE] to-[#E31C24] flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
            <Sparkles className="w-8 h-8 text-[#FFB21C]" />
          </div>

          <h3 className="text-xl font-extrabold text-[#082E63] tracking-tight">
            Piertur kreatiflerinizi hazırlıyor...
          </h3>

          <div className="mt-4 flex items-center justify-center space-x-2 text-xs font-bold text-[#0B63CE] bg-blue-50 py-2 px-4 rounded-full border border-blue-200">
            <Wand2 className="w-3.5 h-3.5 text-[#FFB21C] animate-spin" />
            <span>{MESSAGES[msgIdx]}</span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-6 border border-slate-200">
            <div
              className="bg-gradient-to-r from-[#082E63] via-[#0B63CE] to-[#FFB21C] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-4">
            OpenAI yapay zekası ve Piertur kurumsal master şablon motoru eşzamanlı çalışıyor.
          </p>
        </div>
      </div>
    </div>
  );
};
