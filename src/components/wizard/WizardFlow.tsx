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
import { ContentType, FormatType, DesignModel, CampaignInfo } from '@/types';
import { templatesList } from '@/lib/templates';
import { DesignRepository } from '@/lib/storage/designRepository';
import { generateId } from '@/lib/utils/formatters';

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Adana', 'Antalya', 'Diğer'];
const PRESET_TAGS = [
  'Vade Farksız Taksit',
  'Kupon Fırsatı',
  '5★ Otel Seçeneği',
  'Direkt Uçuş',
  'Erken Rezervasyon',
  'Sınırlı Kontenjan',
  '7/24 Destek',
  '%100 Güvenli Rezervasyon',
];

const SAMPLE_PHOTOS = [
  {
    name: 'Kıbrıs Girne Limanı',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1080&q=80',
  },
  {
    name: 'Akdeniz Sahil Resort',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80',
  },
  {
    name: 'Lüks 5 Yıldızlı Otel',
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1080&q=80',
  },
  {
    name: 'Son Dakika Tatil Havuzu',
    url: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1080&q=80',
  },
];

export const WizardFlow: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [contentType, setContentType] = useState<ContentType>('TUR');
  const [format, setFormat] = useState<FormatType>('IG_STORY');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(SAMPLE_PHOTOS[0].url);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('template-01-price-focused');

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

  const handleCompleteWizard = (data: CampaignFormData) => {
    const selectedTemplate = templatesList.find((t) => t.id === selectedTemplateId) || templatesList[0];

    const campaignPayload: CampaignInfo = {
      ...data,
      backgroundImageUrl: selectedPhoto,
    };

    const generatedCanvas = selectedTemplate.generateCanvasData(campaignPayload);

    const newDesign: DesignModel = {
      id: generateId(),
      name: `${data.title} - ${selectedTemplate.name.split(':')[1]?.trim() || 'Story'}`,
      type: contentType,
      format,
      width: format === 'IG_STORY' ? 1080 : format === 'IG_POST' ? 1080 : 1080,
      height: format === 'IG_STORY' ? 1920 : format === 'IG_POST' ? 1350 : 1080,
      thumbnail: selectedPhoto,
      campaignData: campaignPayload,
      canvasData: generatedCanvas,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    DesignRepository.save(newDesign);
    router.push(`/studio/${newDesign.id}`);
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
            { step: 4, title: 'Fotoğraf & Medya' },
            { step: 5, title: 'Şablon Seçimi' },
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
                desc: 'Kıbrıs, Kültür ve Yurt Dışı Paket Turları',
                icon: Compass,
              },
              {
                id: 'OTEL' as ContentType,
                title: 'Otel',
                desc: '5★ Resort, Otel Konaklama ve Tatil Paketleri',
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
                desc: 'Erken Rezervasyon, Fırsat ve İndirimler',
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
                aspectRatio: 'aspect-[9/16]',
                badge: 'Önerilen MVP',
              },
              {
                id: 'IG_POST' as FormatType,
                title: 'Instagram / FB Post',
                size: '1080 x 1350 px',
                desc: 'Dikey Akış ve Facebook reklam gönderileri',
                icon: LayoutGrid,
                aspectRatio: 'aspect-[4/5]',
              },
              {
                id: 'SQUARE_POST' as FormatType,
                title: 'Kare Post',
                size: '1080 x 1080 px',
                desc: 'Standart kare akış gönderileri',
                icon: Square,
                aspectRatio: 'aspect-square',
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
            Kreatif üzerinde yer alacak reklam metinlerini doldurun.
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
                placeholder="Örn: KIBRIS TURLARI"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#082E63] font-semibold text-[#082E63]"
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
                placeholder="Örn: Akdeniz'in En Gözde Rotası"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#082E63]"
              />
              {errors.subtitle && (
                <p className="text-xs text-[#E31C24] font-medium mt-1">{errors.subtitle.message}</p>
              )}
            </div>

            {/* Nights & Days */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Gece *
                </label>
                <input
                  type="number"
                  {...register('nights', { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#082E63]"
                />
                {errors.nights && (
                  <p className="text-xs text-[#E31C24] font-medium mt-1">{errors.nights.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Gün *
                </label>
                <input
                  type="number"
                  {...register('days', { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#082E63]"
                />
                {errors.days && (
                  <p className="text-xs text-[#E31C24] font-medium mt-1">{errors.days.message}</p>
                )}
              </div>
            </div>

            {/* Price & Currency */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Fiyat *
                </label>
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="25249"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-[#082E63] focus:outline-none focus:ring-2 focus:ring-[#082E63]"
                />
                {errors.price && (
                  <p className="text-xs text-[#E31C24] font-medium mt-1">{errors.price.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Para Birimi
                </label>
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
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Fiyat Prefix
              </label>
              <input
                type="text"
                {...register('pricePrefix')}
                placeholder="Örn: Kişi Başı"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#082E63]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Fiyat Suffix
              </label>
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
            {errors.departureCities && (
              <p className="text-xs text-[#E31C24] font-medium mt-1">
                {errors.departureCities.message}
              </p>
            )}
          </div>

          {/* Campaign Advantages Tags */}
          <div className="mt-6">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Kampanya Avantajları (Tag Sistemi)
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
                placeholder="HEMEN İNCELE"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-[#E31C24] focus:outline-none focus:ring-2 focus:ring-[#082E63]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Hedef URL
              </label>
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
              <span>Devam Et</span>
              <ArrowRight className="w-4 h-4 text-[#FFB21C]" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: MEDIA SELECTION */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-extrabold text-[#082E63]">
              Adım 4: Arka Plan Fotoğrafı Seçin
            </h2>
            <div className="flex items-center gap-2 bg-purple-100 text-purple-900 border border-purple-300 px-3 py-1 rounded-full text-xs font-bold">
              <Wand2 className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Görsel Oluşturma (Yakında)</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-8">
            Bilgisayarınızdan fotoğraf yükleyin veya kütüphaneden seçin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Upload Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Bilgisayardan Yükle (Drag & Drop)
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

              {/* Selected Photo Preview */}
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

            {/* Sample Library Photos */}
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
                      <span className="text-white text-xs font-bold line-clamp-1">
                        {photo.name}
                      </span>
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
              onClick={() => setCurrentStep(5)}
              className="flex items-center space-x-2 bg-[#082E63] hover:bg-[#0B63CE] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <span>Şablonlara Geç</span>
              <ArrowRight className="w-4 h-4 text-[#FFB21C]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: TEMPLATE SELECTION */}
      {currentStep === 5 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
          <h2 className="text-xl font-extrabold text-[#082E63]">Adım 5: Reklam Şablonunu Seçin</h2>
          <p className="text-xs text-slate-500 mt-1 mb-8">
            Şablona tıkladığınızda yazdığınız tüm bilgiler şablon üzerine otomatik yerleşir.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesList.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`cursor-pointer rounded-2xl border-2 overflow-hidden transition-all flex flex-col justify-between hover:shadow-xl ${
                    isSelected
                      ? 'border-[#082E63] bg-blue-50/40 ring-4 ring-blue-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden">
                    <img
                      src={tpl.thumbnailUrl}
                      alt={tpl.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="bg-[#082E63]/90 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-blue-400/40">
                        {tpl.name}
                      </span>
                    </div>

                    {tpl.badge && (
                      <span className="absolute top-3 left-3 bg-[#FFB21C] text-[#082E63] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        {tpl.badge}
                      </span>
                    )}

                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-[#082E63] text-white p-1.5 rounded-full shadow-lg">
                        <Check className="w-4 h-4 text-[#FFB21C]" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-extrabold text-[#082E63] text-sm">{tpl.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{tpl.tagline}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="flex items-center space-x-2 border border-slate-300 text-slate-700 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Geri</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit(handleCompleteWizard)}
              className="flex items-center space-x-3 bg-gradient-to-r from-[#082E63] to-[#0B63CE] hover:brightness-110 text-white px-9 py-4 rounded-xl font-extrabold text-sm shadow-xl transition-all transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 text-[#FFB21C]" />
              <span>Creative Studio&apos;da Aç ve Düzenle</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
