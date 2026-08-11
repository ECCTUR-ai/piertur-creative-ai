'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Settings, Database, Sparkles, Check, Server } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Ayarlar & Sistem Entegrasyonları"
          subtitle="Sistem konfigürasyonu ve Supabase veritabanı ayarları."
          showNewButton={true}
        />

        <main className="p-8 flex-1 space-y-8">
          {/* Storage Mode */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-extrabold text-[#082E63] mb-1">Depolama Mimarisi</h3>
            <p className="text-xs text-slate-500 mb-6">
              MVP sürecinde LocalStorage kullanılmakta, Supabase entegrasyonuna hazır mimari aktif tutulmaktadır.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border-2 border-[#082E63] bg-blue-50/50 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Database className="w-6 h-6 text-[#0B63CE]" />
                    <h4 className="font-extrabold text-[#082E63]">LocalStorage (Aktif MVP)</h4>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300">
                    Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tasarımlarınız tarayıcınızda anında otomatik kaydedilir. İnternet bağlantısı olmadan da kesintisiz çalışır.
                </p>
              </div>

              <div className="p-6 rounded-2xl border-2 border-slate-200 bg-white shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Server className="w-6 h-6 text-[#FFB21C]" />
                    <h4 className="font-extrabold text-[#082E63]">Supabase Database</h4>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-300">
                    Hazır
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Supabase tablosu ve istemcisi tanımlanmış olup, ortam değişkenleri eklendiğinde bulut veri tabanına geçiş sağlanır.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
