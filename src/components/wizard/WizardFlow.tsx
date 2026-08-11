'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Plus,
  Compass,
  Building2,
  CalendarCheck,
  Megaphone,
  Camera,
  LayoutGrid,
  Square,
  Wand2,
} from 'lucide-react';
import { campaignFormSchema, CampaignFormData, defaultCampaignData } from '@/lib/validation/campaignSchema';
import { ContentType, FormatType, CampaignInfo } from '@/types';
import { generateAllVariants } from '@/lib/templates/variantGenerator';
import { DesignRepository } from '@/lib/storage/designRepository';

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Diğer'];
const PRESET_TAGS = [
  'Kayak Pistlerine Yakın',
  'Yemek İmkanı',
  'Ulaşım Dahil',
  'Seyahat Sigortası',
  '7/24 Destek',
  'Vade Farksız Taksit',
  'Kupon Fırsatı',
  '5★ Otel Seçeneği',
  'Erken Rezervasyon',
  'Sınırlı Kontenjan',
];

const SAMPLE_PHOTOS = [
  {
    name: 'Uludağ Kayak Merkezi & Kar',
    url: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1080&q=80',
  },
  {
    name: 'Kıbrıs Girne Limanı',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1080&q=80',
  },
  {
    name: 'Lüks 5 Yıldızlı Otel',
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1080&q=80',
  },
  {
    name: 'Akdeniz Sahil Resort',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80',
  },
];

export const WizardFlow: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [contentType, setContentType] = useState<ContentType>('TUR');
  const [format, setFormat] = useState<FormatType>('IG_STORY');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(SAMPLE_PHOTOS[0].url);
  const [customTagInput, setCustomTagInput] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: defaultCampaignData,
  });

  const watchDepartureCities = watch('departureCities') || [];
  const watchTags = watch('tags') || [];

  const handleCityToggle = (city: string) => {
    const current = [...watchDepartureCities];
    if (current.includes(city)) {
      setValue(
        'departureCities',
        current.filter((c) => c !== city)
      );
    } else {
      setValue('departureCities', [...current, city]);
    }
  };

  const handleTagToggle = (tag: string) => {
    const current = [...watchTags];
    if (current.includes(tag)) {
      setValue(
        'tags',
        current.filter((t) => t !== tag)
      );
    } else {
      setValue('tags', [...current, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    const tagToAdd = customTagInput.trim();
    if (!watchTags.includes(tagToAdd)) {
      setValue('tags', [...watchTags, tagToAdd]);
    }
    setCustomTagInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setSelectedPhoto(dataUrl);
          setValue('backgroundImageUrl', dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitStep3 = () => {
    setCurrentStep(4);
  };

  const handleGenerateAllCreatives = (data: CampaignFormData) => {
    const campaignPayload: CampaignInfo = {
      ...data,
      backgroundImageUrl: selectedPhoto,
    };

    const variants = generateAllVariants(campaignPayload);
    const generationId = 'gen_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    DesignRepository.saveGenerationGroup(generationId, variants);

    // Route directly to Generated Designs page
    router.push(`/designs/generated/${generationId}`);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Wizard Progress Indicator */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs mb-8">
        <div className="flex items-center justify-between">
          {[
            { step: 1, title: 'İçerik Türü' },
            { step: 2, title: 'Format' },
            { step: 3, title: 'Kampanya Bilgileri' },
            { step: 4, title: 'Fotoğraf & Üretim' },
          ].map((item, index, arr) => (
            <React.Fragment key={item.step}>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                    currentStep === item.step
                      ? 'bg-[#082E63] text-white shadow-md ring-4 ring-blue-100'
                      : currentStep > item.step
                      ? 'bg-[#0B63CE] text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > item.step ? <Check className="w-4 h-4" /> : item.step}
                </div>
                <span
                  className={`text-xs font-semibold hidden md:inline-block ${
                    currentStep === item.step ? 'text-[#082E63]' : 'text-slate-500'
                  }`}
                >
                  {item.title}
                </span>
              </div>
              {index < arr.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 hidden sm:block ${
                    currentStep > item.step ? 'bg-[#0B63CE]' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STEP 1: CONTENT TYPE */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
          <h2 className="text-xl font-extrabold text-[#082E63]">Adım 1: İçerik Türünü Seçin</h2>
          <p className="text-xs text-slate-500 mt-1 mb-8">
            Hazırlayacağınız reklam kreatifinin ana kategorisini belirleyin.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 'TUR' as ContentType,
                title: 'Tur',
                desc: 'Uludağ, Kıbrıs, Kültür ve Yurt Dışı Paket Turları',
                icon: Compass,
              },
              {
                id: 'OTEL' as ContentType,
                title: 'Otel',
                desc: 'Beceren Otel, Resort ve Lüks Konaklama',
                icon: Building2,
              },
              {
                id: 'MICE' as ContentType,
                title: 'MICE / Event',
                desc: 'Kurumsal Etkinlik, Kongre ve Toplantılar',
                icon: CalendarCheck,
              },
              {
                id: 'KAMPANYA' as ContentType,
                title: 'Kampanya',
                desc: 'Son Dakika Fırsatı, Erken Rezervasyon',
                icon: Megaphone,
              },
            ].map((card) => {
              const Icon = card.icon;
              const isSelected = contentType === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => setContentType(card.id)}
                  className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col justify-between hover:shadow-md ${
                    isSelected
                      ? 'border-[#082E63] bg-blue-50/50 shadow-md ring-2 ring-blue-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        isSelected ? 'bg-[#082E63] text-[#FFB21C]' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-[#082E63] text-lg">{card.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{card.desc}</p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-[#082E63] text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center space-x-2 bg-[#082E63] hover:bg-[#0B63CE] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <span>Devam Et</span>
              <ArrowRight className="w-4 h-4 text-[#FFB21C]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: FORMAT */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-extrabold text-[#082E63]">Adım 2: Görsel Formatını Seçin</h2>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full border border-amber-300">
              MVP Öncelikli: Instagram Story
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-8">
            Reklamınızın yayınlanacağı medya boyutunu seçin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 'IG_STORY' as FormatType,
                title: 'Instagram Story',
                size: '1080 x 1920 px',
                desc: 'Story ve Reels reklamları için tam dikey format',
                icon: Camera,
                badge: 'Önerilen MVP',
              },
              {
                id: 'IG_POST' as FormatType,
                title: 'Instagram / FB Post',
                size: '1080 x 1350 px',
                desc: 'Dikey Akış ve Facebook reklam gönderileri',
                icon: LayoutGrid,
              },
              {
                id: 'SQUARE_POST' as FormatType,
                title: 'Kare Post',
                size: '1080 x 1080 px',
                desc: 'Standart kare akış gönderileri',
                icon: Square,
              },
            ].map((card) => {
              const Icon = card.icon;
              const isSelected = format === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => setFormat(card.id)}
                  className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col justify-between hover:shadow-md ${
                    isSelected
                      ? 'border-[#082E63] bg-blue-50/50 shadow-md ring-2 ring-blue-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#082E63] text-[#FFB21C]' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {card.badge && (
                        <span className="text-[10px] bg-[#FFB21C] text-[#082E63] font-bold px-2 py-0.5 rounded-full">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-[#082E63] text-lg">{card.title}</h3>
                    <p className="text-xs font-mono font-bold text-[#0B63CE] mt-1">{card.size}</p>
                    <p className="text-xs text-slate-500 mt-2">{card.desc}</p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-[#082E63] text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center space-x-2 border border-slate-300 text-slate-700 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Geri</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex items-center space-x-2 bg-[#082E63] hover:bg-[#0B63CE] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <span>Devam Et</span>
              <ArrowRight className="w-4 h-4 text-[#FFB21C]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CAMPAIGN DETAILS FORM */}
      {currentStep === 3 && (
        <form onSubmit={handleSubmit(onSubmitStep3)} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
          <h2 className="text-xl font-extrabold text-[#082E63]">Adım 3: Kampanya Bilgileri</h2>
          <p className="text-xs text-slate-500 mt-1 mb-8">
            Kreatif üzerinde yer alacak kurumsal metin ve fiyat bilgilerini doldurun.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Kampanya Başlığı *
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="Örn: Uludağ Konaklamalı Tur"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#082E63] focus:outline-none focus:ring-2 focus:ring-[#082E63]"
              />
              {errors.title && (
                <p className="text-xs text-[#E31C24] font-medium mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Alt Başlık *
              </label>
              <input
                type="text"
                {...register('subtitle')}
                placeholder="Örn: Türkiye'nin En Sevilen Kayak Rotası"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#082E63]"
              />
            </div>

            {/* Hotel Name & Board Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Otel Adı / Pill Bilgisi
              </label>
              <input
                type="text"
                {...register('hotelName')}
                placeholder="Örn: Beceren Otel"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#082E63]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Pansiyon Tipi
              </label>
              <input
                type="text"
                {...register('boardType')}
                placeholder="Örn: Yarım Pansiyon"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#082E63]"
              />
            </div>

            {/* Ribbon Badge Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Rozet / Banner Metni
              </label>
              <input
                type="text"
                {...register('badgeText')}
                placeholder="Örn: SON DAKİKA FIRSATI"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-[#E31C24] focus:outline-none focus:ring-2 focus:ring-[#082E63]"
              />
            </div>

            {/* Nights & Days */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Gece *</label>
                <input
                  type="number"
                  {...register('nights', { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#082E63]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Gün *</label>
                <input
                  type="number"
                  {...register('days', { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#082E63]"
                />
              </div>
            </div>

            {/* Price & Currency */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Fiyat *</label>
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="25249"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-[#082E63] focus:outline-none focus:ring-2 focus:ring-[#082E63]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Para Birimi</label>
                <select
                  {...register('currency')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#082E63]"
                >
                  <option value="TL">TL</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            {/* Price Prefix & Suffix */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Fiyat Prefix</label>
              <input
                type="text"
                {...register('pricePrefix')}
                placeholder="Örn: Kişi Başı"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#082E63]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Fiyat Suffix</label>
              <input
                type="text"
                {...register('priceSuffix')}
                placeholder="Örn: 'den başlayan fiyatlarla"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#082E63]"
              />
            </div>
          </div>

          {/* Departure Cities */}
          <div className="mt-6">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Çıkış Şehirleri *
            </label>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((city) => {
                const isSelected = watchDepartureCities.includes(city);
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleCityToggle(city)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-[#082E63] text-white border-[#082E63] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {city} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campaign Advantages Tags */}
          <div className="mt-6">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Kampanya Avantajları (İkonlu Tag Sistem)
            </label>

            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_TAGS.map((tag) => {
                const isSelected = watchTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                      isSelected
                        ? 'bg-[#0B63CE] text-white border-[#0B63CE] shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {tag} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                placeholder="Özel avantaj ekle..."
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#082E63]"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ekle</span>
              </button>
            </div>
          </div>

          {/* CTA & URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                CTA Butonu Yazısı
              </label>
              <input
                type="text"
                {...register('ctaText')}
                placeholder="HEMEN REZERVASYON YAP"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-[#E31C24] focus:outline-none focus:ring-2 focus:ring-[#082E63]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Hedef URL</label>
              <input
                type="text"
                {...register('ctaUrl')}
                placeholder="https://piertur.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#082E63]"
              />
            </div>
          </div>

          <div className="mt-10 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center space-x-2 border border-slate-300 text-slate-700 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Geri</span>
            </button>

            <button
              type="submit"
              className="flex items-center space-x-2 bg-[#082E63] hover:bg-[#0B63CE] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <span>Fotoğrafa Geç</span>
              <ArrowRight className="w-4 h-4 text-[#FFB21C]" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: MEDIA SELECTION & TASARIMLARI OLUŞTUR */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-extrabold text-[#082E63]">Adım 4: Arka Plan Fotoğrafı Seçin</h2>
            <div className="flex items-center gap-2 bg-purple-100 text-purple-900 border border-purple-300 px-3 py-1 rounded-full text-xs font-bold">
              <Wand2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Akıllı Fotoğraf Motoru</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-8">
            Fotoğraf otomatik subject-safe crop ve localized vignette karartması ile yerleşir.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Bilgisayardan Yükle
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-[#0B63CE] rounded-2xl p-8 text-center bg-slate-50 hover:bg-blue-50/40 transition-all relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-10 h-10 text-[#0B63CE] mx-auto mb-3" />
                <h4 className="font-bold text-sm text-[#082E63]">Fotoğrafı Sürükleyin veya Tıklayın</h4>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP (Max 10MB)</p>
              </div>

              {selectedPhoto && (
                <div className="mt-6">
                  <span className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Seçili Görsel Önizleme
                  </span>
                  <div className="relative aspect-[9/16] max-h-72 rounded-2xl overflow-hidden border-2 border-[#082E63] shadow-md bg-slate-900 mx-auto">
                    <img src={selectedPhoto} alt="Selected" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#FFB21C]" />
                      <span>Aktif Görsel</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Medya Kütüphanesinden Seç
              </label>
              <div className="grid grid-cols-2 gap-4">
                {SAMPLE_PHOTOS.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedPhoto(photo.url)}
                    className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all relative group aspect-[9/16] ${
                      selectedPhoto === photo.url
                        ? 'border-[#082E63] ring-4 ring-blue-200 scale-102'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                      <span className="text-white text-xs font-bold line-clamp-1">{photo.name}</span>
                    </div>
                    {selectedPhoto === photo.url && (
                      <div className="absolute top-2 right-2 bg-[#082E63] text-white p-1 rounded-full shadow-md">
                        <Check className="w-3.5 h-3.5 text-[#FFB21C]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex items-center space-x-2 border border-slate-300 text-slate-700 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Geri</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit(handleGenerateAllCreatives)}
              className="flex items-center space-x-3 bg-gradient-to-r from-[#082E63] to-[#E31C24] hover:brightness-110 text-white px-9 py-4 rounded-xl font-extrabold text-sm shadow-xl transition-all transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 text-[#FFB21C]" />
              <span>TASARIMLARI OLUŞTUR</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
