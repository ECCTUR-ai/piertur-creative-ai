'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Database, Server, Bot, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [variantCount, setVariantCount] = useState<number>(3);
  const [imageQuality, setImageQuality] = useState<'standard' | 'hd'>('standard');
  const [fallbackEnabled, setFallbackEnabled] = useState<boolean>(true);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Ayarlar & Sistem Entegrasyonları"
          subtitle="Sistem konfigürasyonu, OpenAI AI ayarları ve depolama mimarisi."
          showNewButton={true}
        />

        <main className="p-8 flex-1 space-y-8">
          {/* Admin AI Creative Settings */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <Bot className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-extrabold text-[#082E63]">OpenAI AI Creative Ayarları</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Yapay zeka destekli reklam görseli üretimi ve hybrid compositor konfigürasyonu.
                </p>
              </div>

              <div className="flex items-center space-x-2 bg-purple-50 text-purple-900 border border-purple-200 px-4 py-2 rounded-xl text-xs font-bold">
                <KeyRound className="w-4 h-4 text-purple-600" />
                <span>OPENAI_API_KEY (Server Env Managed)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase">AI Üretimi Aktiflik</label>
                  <input
                    type="checkbox"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                    className="w-5 h-5 text-[#082E63] rounded focus:ring-2 focus:ring-[#082E63]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase">Varsayılan Variant Sayısı</label>
                  <select
                    value={variantCount}
                    onChange={(e) => setVariantCount(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold"
                  >
                    <option value={3}>3 Variant (Fiyat, Destinasyon, Fırsat)</option>
                    <option value={1}>1 Variant</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase">Görsel Kalite Modu</label>
                  <select
                    value={imageQuality}
                    onChange={(e) => setImageQuality(e.target.value as 'standard' | 'hd')}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold"
                  >
                    <option value="standard">Standard (Hızlı)</option>
                    <option value="hd">HD Quality</option>
                  </select>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase">Master Template Fallback Motoru</label>
                  <input
                    type="checkbox"
                    checked={fallbackEnabled}
                    onChange={(e) => setFallbackEnabled(e.target.checked)}
                    className="w-5 h-5 text-[#082E63] rounded focus:ring-2 focus:ring-[#082E63]"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  API Key tanımlanmadığında veya OpenAI kota/timeout durumunda kullanıcıya otomatik kurumsal V2 şablon sunulmasını sağlar.
                </p>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Güvenli Server-Side Mimarisi Aktif</span>
                </div>
              </div>
            </div>
          </div>

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
