'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Upload, Image as ImageIcon, Wand2 } from 'lucide-react';

const MEDIA_ITEMS = [
  { name: 'Kıbrıs Girne Limanı & Kalesi', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80' },
  { name: 'Akdeniz Palmiyeli Sahil', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lüks 5 Yıldızlı Resort Otel', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Son Dakika Tatil Havuz Keyfi', url: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=800&q=80' },
  { name: 'Minimalist Tropik Tatil Manzarası', url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80' },
];

export default function MediaPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Medya Kütüphanesi"
          subtitle="Yüklenen görseller ve stok turizm fotoğrafları."
          showNewButton={true}
        />

        <main className="p-8 flex-1">
          {/* Upload Banner */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-extrabold text-[#082E63]">Fotoğraf Yükle</h3>
              <p className="text-xs text-slate-500 mt-1">
                Yüksek çözünürlüklü kampanya ve destinasyon fotoğraflarınızı kütüphaneye ekleyin.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <label className="cursor-pointer bg-[#082E63] hover:bg-[#0B63CE] text-white px-5 py-3 rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition-all">
                <Upload className="w-4 h-4 text-[#FFB21C]" />
                <span>Fotoğraf Yükle</span>
                <input type="file" className="hidden" accept="image/*" />
              </label>

              <div className="flex items-center space-x-2 bg-purple-100 text-purple-900 border border-purple-300 px-4 py-3 rounded-xl text-xs font-bold">
                <Wand2 className="w-4 h-4 text-purple-600" />
                <span>AI Görsel Üretimi (Yakında)</span>
              </div>
            </div>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {MEDIA_ITEMS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group"
              >
                <div className="aspect-[9/16] bg-slate-900 overflow-hidden relative">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-[#082E63] truncate">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
