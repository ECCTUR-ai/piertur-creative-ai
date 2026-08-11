'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DesignRepository } from '@/lib/storage/designRepository';
import { LargeStoryPreview } from '@/components/preview/LargeStoryPreview';
import { VideoMotionModal } from '@/components/studio/VideoMotionModal';
import { DesignModel } from '@/types';
import { Edit3, Download, Film, Sparkles, CheckCircle2, ArrowLeft, RefreshCw, Bot, AlertTriangle } from 'lucide-react';
import { AIGenerationLoadingModal } from '@/components/wizard/AIGenerationLoadingModal';

export default function GeneratedDesignsPage() {
  const params = useParams();
  const router = useRouter();
  const generationId = params?.generationId as string;

  const [designs, setDesigns] = useState<DesignModel[]>(() => {
    return DesignRepository.getGenerationGroup(generationId);
  });

  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Check overall generation source across designs
  const hasTrueAiSuccess = designs.some((d) => d.generationSource === 'openai' && d.aiSuccess === true);
  const activeModel = designs[0]?.model || 'gpt-image-2';

  // Single Variant Regeneration handler
  const handleRegenerateVariant = async (variant: DesignModel, index: number) => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    setStatusNotice(null);

    try {
      const res = await fetch('/api/ai/generate-creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant: variant.variantType,
          payload: {
            campaignTitle: variant.campaignData.title,
            subtitle: variant.campaignData.subtitle,
            hotelName: variant.campaignData.hotelName,
            nights: variant.campaignData.nights,
            days: variant.campaignData.days,
            boardType: variant.campaignData.boardType,
            price: variant.campaignData.price,
            currency: variant.campaignData.currency,
            pricePrefix: variant.campaignData.pricePrefix,
            priceSuffix: variant.campaignData.priceSuffix,
            departureCities: variant.campaignData.departureCities,
            benefits: variant.campaignData.tags,
            campaignBadge: variant.campaignData.badgeText,
            cta: variant.campaignData.ctaText,
            website: variant.campaignData.ctaUrl,
            uploadedImage: variant.campaignData.backgroundImageUrl,
          },
        }),
      });

      const json = await res.json();
      if (!json.aiSuccess || json.generationSource === 'fallback') {
        setStatusNotice(
          `AI servisine ulaşılamadı (${json.fallbackReason || 'Model yanıtı alınamadı'}). Kurumsal şablon ile güncellendi.`
        );
      }

      if (json.variant) {
        const updated = [...designs];
        updated[index] = json.variant;
        setDesigns(updated);
        DesignRepository.saveGenerationGroup(generationId, updated);
      }
    } catch (e) {
      console.error('Variant Regeneration error', e);
      setStatusNotice('Tasarım oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Regenerate All 3 Variants
  const handleRegenerateAll = async () => {
    if (isRegenerating || designs.length === 0) return;
    setIsRegenerating(true);
    setStatusNotice(null);

    const ref = designs[0];
    try {
      const res = await fetch('/api/ai/generate-creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: {
            campaignTitle: ref.campaignData.title,
            subtitle: ref.campaignData.subtitle,
            hotelName: ref.campaignData.hotelName,
            nights: ref.campaignData.nights,
            days: ref.campaignData.days,
            boardType: ref.campaignData.boardType,
            price: ref.campaignData.price,
            currency: ref.campaignData.currency,
            pricePrefix: ref.campaignData.pricePrefix,
            priceSuffix: ref.campaignData.priceSuffix,
            departureCities: ref.campaignData.departureCities,
            benefits: ref.campaignData.tags,
            campaignBadge: ref.campaignData.badgeText,
            cta: ref.campaignData.ctaText,
            website: ref.campaignData.ctaUrl,
            uploadedImage: ref.campaignData.backgroundImageUrl,
          },
        }),
      });

      const json = await res.json();
      if (!json.aiSuccess || json.generationSource === 'fallback') {
        setStatusNotice(
          `AI servisine ulaşılamadı (${json.fallbackReason || 'OpenAI API ulaşılamadı'}). Kurumsal şablonlar ile üretildi.`
        );
      }
      if (json.variants) {
        setDesigns(json.variants);
        DesignRepository.saveGenerationGroup(generationId, json.variants);
      }
    } catch (e) {
      console.error('Regenerate all error', e);
      setStatusNotice('Tasarım oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // High Resolution PNG Export helper
  const handleExportPNG = (design: DesignModel) => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1080;
    exportCanvas.height = 1920;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = design.canvasData.backgroundColor || '#082E63';
    ctx.fillRect(0, 0, 1080, 1920);

    const sortedLayers = [...design.canvasData.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    const renderPromises = sortedLayers.map((layer) => {
      return new Promise<void>((resolve) => {
        if (layer.visible === false) return resolve();

        ctx.save();
        ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;

        if (layer.type === 'rect') {
          const rectW = layer.width || 100;
          const rectH = layer.height || 100;
          const radius = layer.borderRadius || 0;

          if (layer.fill?.startsWith('linear-gradient')) {
            const gradient = ctx.createLinearGradient(0, layer.y, 0, layer.y + rectH);
            gradient.addColorStop(0, 'rgba(8, 46, 99, 0.95)');
            gradient.addColorStop(0.5, 'rgba(8, 46, 99, 0.5)');
            gradient.addColorStop(1, 'rgba(8, 46, 99, 0.98)');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = layer.fill || '#082E63';
          }

          ctx.beginPath();
          if (radius > 0 && ctx.roundRect) {
            ctx.roundRect(layer.x, layer.y, rectW, rectH, radius);
          } else {
            ctx.rect(layer.x, layer.y, rectW, rectH);
          }
          ctx.fill();

          if (layer.stroke && layer.strokeWidth) {
            ctx.strokeStyle = layer.stroke;
            ctx.lineWidth = layer.strokeWidth;
            ctx.stroke();
          }
          ctx.restore();
          resolve();
        } else if (layer.type === 'text') {
          ctx.font = `${layer.fontWeight || '700'} ${layer.fontSize || 32}px ${
            layer.fontFamily || 'Montserrat, sans-serif'
          }`;
          ctx.fillStyle = layer.fill || '#FFFFFF';
          ctx.textBaseline = 'top';

          if (layer.textAlign === 'center') ctx.textAlign = 'center';
          else if (layer.textAlign === 'right') ctx.textAlign = 'right';
          else ctx.textAlign = 'left';

          ctx.fillText(layer.text || '', layer.x, layer.y);
          ctx.restore();
          resolve();
        } else if (layer.type === 'image' && layer.src) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.drawImage(img, layer.x, layer.y, layer.width || 1080, layer.height || 1920);
            ctx.restore();
            resolve();
          };
          img.onerror = () => {
            ctx.restore();
            resolve();
          };
          img.src = layer.src;
        } else {
          ctx.restore();
          resolve();
        }
      });
    });

    Promise.all(renderPromises).then(() => {
      const dataUrl = exportCanvas.toDataURL('image/png', 0.98);
      const downloadLink = document.createElement('a');
      downloadLink.download = `${design.name.replace(/\s+/g, '_')}_1080x1920.png`;
      downloadLink.href = dataUrl;
      downloadLink.click();
    });
  };

  const getVariantTitle = (index: number) => {
    switch (index) {
      case 0:
        return '1. Fiyat Odaklı';
      case 1:
        return '2. Destinasyon Odaklı';
      case 2:
        return '3. Fırsat Odaklı';
      default:
        return `Kreatif ${index + 1}`;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Tasarımlarınız Hazır"
          subtitle="OpenAI ve Piertur kurumsal motoru ile 3 farklı reklam kreatifi üretildi."
          showNewButton={true}
        />

        <AIGenerationLoadingModal isOpen={isRegenerating} />

        <main className="p-8 flex-1">
          {/* Status Notice if Fallback or Error */}
          {statusNotice && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{statusNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusNotice(null)}
                className="text-slate-500 hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Top Info Banner with Regenerate All 3 Button */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  hasTrueAiSuccess ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {hasTrueAiSuccess ? <Bot className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-extrabold text-[#082E63]">
                    3 Kurumsal Reklam Kreatifiniz Tamamlandı
                  </h2>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                      hasTrueAiSuccess
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    <Bot className="w-3 h-3 text-purple-600" />
                    <span>{hasTrueAiSuccess ? `OpenAI ${activeModel}` : 'Master Template Fallback'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tasarımı indirmek için &quot;İndir&quot;, yeniden üretmek için &quot;Yeniden Üret&quot;, son düzenlemeler için &quot;Düzenle&quot; butonuna basın.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleRegenerateAll}
                disabled={isRegenerating}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-700 to-[#082E63] hover:brightness-110 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#FFB21C]" />
                <span>3 Tasarımı Yeniden Üret</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/wizard')}
                className="flex items-center space-x-2 border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Yeni Bilgiler Gir</span>
              </button>
            </div>
          </div>

          {/* 3 Large Previews Side-by-Side Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {designs.map((design, idx) => {
              const isAiVariant = design.generationSource === 'openai' && design.aiSuccess === true;

              return (
                <div
                  key={design.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  {/* Variant Header Title + Explicit AI / Fallback Metadata Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-[#FFB21C]" />
                        <h3 className="font-extrabold text-[#082E63] text-lg">
                          {getVariantTitle(idx)}
                        </h3>
                      </div>
                      {design.endpoint && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          Endpoint: {design.endpoint} {design.inputImageBytes ? `(${Math.round(design.inputImageBytes / 1024)} KB)` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {design.inputImageUsed && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-900 border-emerald-300 flex items-center gap-1">
                          <span>📸 Edit Input: EVET</span>
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          isAiVariant
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        <Bot className="w-3 h-3 text-purple-600" />
                        <span>{isAiVariant ? 'OpenAI Image' : 'Master Fallback'}</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#0B63CE] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        Story
                      </span>
                    </div>
                  </div>

                  {/* Large 340px Story Preview Canvas */}
                  <div className="py-2">
                    <LargeStoryPreview canvasData={design.canvasData} name={design.name} width={340} />
                  </div>

                  {/* Action Buttons under Preview */}
                  <div className="mt-6 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => router.push(`/studio/${design.id}`)}
                      className="w-full bg-[#082E63] hover:bg-[#0B63CE] text-white py-3.5 rounded-xl font-extrabold text-xs shadow-md flex items-center justify-center space-x-2 transition-all transform hover:scale-102"
                    >
                      <Edit3 className="w-4 h-4 text-[#FFB21C]" />
                      <span>BU TASARIMI KULLAN</span>
                    </button>

                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleExportPNG(design)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-[10px] flex items-center justify-center space-x-1 transition-all shadow-xs"
                        title="Direkt Full Resolution PNG İndir"
                      >
                        <Download className="w-3 h-3" />
                        <span>İNDİR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRegenerateVariant(design, idx)}
                        disabled={isRegenerating}
                        className="bg-purple-700 hover:bg-purple-800 text-white py-2.5 rounded-xl font-bold text-[10px] flex items-center justify-center space-x-1 transition-all disabled:opacity-50"
                        title="Yalnızca Bu Variantı Yapay Zeka ile Yeniden Üret"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>YENİDEN</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push(`/studio/${design.id}`)}
                        className="bg-slate-800 hover:bg-black text-white py-2.5 rounded-xl font-bold text-[10px] flex items-center justify-center space-x-1 transition-all"
                        title="Creative Studio'da Düzenle"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>DÜZENLE</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVideoModalOpen(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-bold text-[10px] flex items-center justify-center space-x-1 transition-all"
                        title="Video Animasyona Dönüştür"
                      >
                        <Film className="w-3 h-3" />
                        <span>HAREKET</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Video Motion Modal */}
      <VideoMotionModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} />
    </div>
  );
}
