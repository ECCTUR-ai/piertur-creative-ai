'use client';

import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { templatesList } from '@/lib/templates';
import { LayoutTemplate, Sparkles } from 'lucide-react';

export default function TemplatesPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Şablon Kütüphanesi"
          subtitle="Turizm reklamları için özel hazırlanmış Instagram Story şablonları."
          showNewButton={true}
        />

        <main className="p-8 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesList.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden">
                  <img
                    src={tpl.thumbnailUrl}
                    alt={tpl.name}
                    className="w-full h-full object-cover"
                  />
                  {tpl.badge && (
                    <span className="absolute top-3 left-3 bg-[#FFB21C] text-[#082E63] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {tpl.badge}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-extrabold text-[#082E63] text-base">{tpl.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{tpl.tagline}</p>

                  <Link
                    href="/wizard"
                    className="mt-5 w-full bg-[#082E63] hover:bg-[#0B63CE] text-white py-3 rounded-xl text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#FFB21C]" />
                    <span>Bu Şablon ile Oluştur</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
