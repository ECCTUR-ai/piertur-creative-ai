'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Upload, Sparkles, Globe, Phone, Camera, Check } from 'lucide-react';
import { BrandRepository, PierturBrandKit } from '@/lib/storage/brandRepository';

export default function BrandPage() {
  const [brandKit, setBrandKit] = useState<PierturBrandKit>(() => BrandRepository.getBrandKit());
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updated = BrandRepository.saveBrandKit({ logoUrl: dataUrl });
      setBrandKit(updated);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Marka Kiti"
          subtitle="Piertur kurumsal kimlik renkleri, logo ve tipografi kuralları."
          showNewButton={true}
        />

        <main className="p-8 flex-1 space-y-8 max-w-5xl">
          {savedNotice && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Marka kiti ve logosu başarıyla güncellendi! Bütün reklam kreatiflerinde kullanılacak.</span>
              </div>
            </div>
          )}

          {/* Logo Section */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#082E63]">Marka Logosu</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reklam şablonlarında otomatik kullanılacak şeffaf SVG veya PNG logosu yükleyin.
                </p>
              </div>

              <label className="cursor-pointer bg-[#082E63] hover:bg-[#0B63CE] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition-all">
                <Upload className="w-4 h-4 text-[#FFB21C]" />
                <span>Yeni Logo Yükle</span>
                <input type="file" className="hidden" accept="image/svg+xml,image/png" onChange={handleLogoUpload} />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Primary Navy Logo Badge */}
              <div className="bg-[#082E63] p-8 rounded-2xl text-center flex flex-col items-center justify-center border border-blue-900 shadow-md">
                {brandKit.logoUrl ? (
                  <div className="max-h-16 flex items-center justify-center mb-2">
                    <img src={brandKit.logoUrl} alt="Custom Logo" className="max-h-14 object-contain" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB21C] to-[#E31C24] flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-widest">PIERTUR</span>
                  </div>
                )}
                <span className="text-[10px] font-bold text-[#FFB21C] tracking-widest uppercase">
                  Creative AI Studio
                </span>
                <span className="text-[11px] text-slate-400 mt-4 font-mono">Koyu Arka Plan Logosudur</span>
              </div>

              {/* White Background Logo Badge */}
              <div className="bg-slate-100 p-8 rounded-2xl text-center flex flex-col items-center justify-center border border-slate-300 shadow-xs">
                {brandKit.logoUrl ? (
                  <div className="max-h-16 flex items-center justify-center mb-2">
                    <img src={brandKit.logoUrl} alt="Custom Logo" className="max-h-14 object-contain" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#082E63] flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5 text-[#FFB21C]" />
                    </div>
                    <span className="text-2xl font-black text-[#082E63] tracking-widest">PIERTUR</span>
                  </div>
                )}
                <span className="text-[10px] font-bold text-[#0B63CE] tracking-widest uppercase">
                  Creative AI Studio
                </span>
                <span className="text-[11px] text-slate-500 mt-4 font-mono">Açık Arka Plan Logosudur</span>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-extrabold text-[#082E63] mb-1">Kurumsal Renk Paleti</h3>
            <p className="text-xs text-slate-500 mb-6">Piertur reklam şablonları için onaylı renkler.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { name: 'Ana Renk (Koyu Lacivert)', hex: brandKit.primaryNavy, desc: 'Ana Arka Plan & Kartlar' },
                { name: 'Destek Rengi (Mavi)', hex: '#0B63CE', desc: 'Rozetler & Vurgular' },
                { name: 'Gold Altın', hex: brandKit.brandYellow, desc: 'Fiyat & Başlık Vurgusu' },
                { name: 'Kırmızı Akzent', hex: brandKit.accentRed, desc: 'CTA & Fırsat Butonları' },
                { name: 'Beyaz', hex: brandKit.brandWhite, desc: 'Ana Metin Rengi' },
              ].map((c) => (
                <div
                  key={c.hex}
                  className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                >
                  <div className="h-28 w-full" style={{ backgroundColor: c.hex }} />
                  <div className="p-4 bg-white">
                    <h4 className="font-bold text-xs text-[#082E63]">{c.name}</h4>
                    <p className="font-mono text-xs font-bold text-[#0B63CE] mt-1">{c.hex}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info Presets */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-extrabold text-[#082E63] mb-1">Footer İletişim Bilgileri</h3>
            <p className="text-xs text-slate-500 mb-6">Şablonların en alt kısmında otomatik basılacak bilgiler.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center space-x-3">
                <Globe className="w-5 h-5 text-[#0B63CE]" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Web Sitesi</span>
                  <p className="font-bold text-sm text-[#082E63]">{brandKit.website}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center space-x-3">
                <Camera className="w-5 h-5 text-[#FFB21C]" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Instagram</span>
                  <p className="font-bold text-sm text-[#082E63]">{brandKit.socialHandle}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#E31C24]" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Çağrı Merkezi</span>
                  <p className="font-bold text-sm text-[#082E63]">{brandKit.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
