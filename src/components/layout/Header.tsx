'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Plus, Bell } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showNewButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Piertur Creative AI',
  subtitle = 'Sosyal medya kreatiflerinizi dakikalar içinde hazırlayın.',
  showNewButton = true,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-xs sticky top-0 z-20">
      <div>
        <h1 className="text-2xl font-extrabold text-[#082E63] tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>
      </div>

      <div className="flex items-center space-x-4">
        <button
          type="button"
          className="p-2.5 rounded-xl text-slate-500 hover:text-[#082E63] hover:bg-slate-100 transition-colors relative"
          title="Bildirimler"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E31C24]"></span>
        </button>

        {showNewButton && (
          <Link
            href="/wizard"
            className="flex items-center space-x-2 bg-[#082E63] hover:bg-[#0B63CE] text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all text-sm group"
          >
            <Plus className="w-4 h-4 text-[#FFB21C] group-hover:rotate-90 transition-transform" />
            <span>Yeni Tasarım Oluştur</span>
          </Link>
        )}
      </div>
    </header>
  );
};
