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
    const group = DesignRepository.getGenerationGroup(generationId);
    // Display PRICE_HERO as single hero design
    return group.slice(0, 1);
  });

  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const heroDesign = designs[0];
  const isTrueAi = heroDesign?.generationSource === 'openai' && heroDesign?.aiSuccess === true;
  const activeModel = heroDesign?.model || 'gpt-image-2';

  // Single PRICE_HERO Variant Regeneration handler
  const handleRegenerateVariant = async () => {
    if (isRegenerating || !heroDesign) return;
    setIsRegenerating(true);
    setStatusNotice(null);

    try {
      const res = await fetch('/api/ai/generate-creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          singleVariantOnly: true,
          variant: 'PRICE_FOCUSED',
          payload: {
            campaignTitle: heroDesign.campaignData.title,
            subtitle: heroDesign.campaignData.subtitle,
            hotelName: heroDesign.campaignData.hotelName,
            nights: heroDesign.campaignData.nights,
            days: heroDesign.campaignData.days,
            boardType: heroDesign.campaignData.boardType,
            price: heroDesign.campaignData.price,
            currency: heroDesign.campaignData.currency,
            pricePrefix: heroDesign.campaignData.pricePrefix,
            priceSuffix: heroDesign.campaignData.priceSuffix,
            departureCities: heroDesign.campaignData.departureCities,
            benefits: heroDesign.campaignData.tags,
            campaignBadge: heroDesign.campaignData.badgeText,
            cta: heroDesign.campaignData.ctaText,
            website: heroDesign.campaignData.ctaUrl,
            uploadedImage: heroDesign.campaignData.backgroundImageUrl,
          },
        }),
      });

      const json = await res.json();
      if (!json.aiSuccess || json.generationSource === 'fallback') {
        setStatusNotice(
          `AI servisine ulaşılamadı (${json.fallbackReason || 'Model yanıtı alınamadı'}). Kurumsal şablon ile güncellendi.`
        );
      }

      const updatedVariant = json.variant || (json.variants && json.variants[0]);
      if (updatedVariant) {
        setDesigns([updatedVariant]);
        DesignRepository.saveGenerationGroup(generationId, [updatedVariant]);
      }
    } catch (e) {
      console.error('Variant Regeneration error', e);
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

    const imageLayers = sortedLayers.filter((el) => el.type === 'image' && el.src);
    const imagePromises = imageLayers.map((layer) => {
      return new Promise<{ id: string; img: HTMLImageElement | null }>((resolve) => {
        if (!layer.src) return resolve({ id: layer.id, img: null });

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ id: layer.id, img });
        img.onerror = () => {
          const fallbackImg = new Image();
          fallbackImg.onload = () => resolve({ id: layer.id, img: fallbackImg });
          fallbackImg.onerror = () => resolve({ id: layer.id, img: null });
          fallbackImg.src = layer.src!;
        };
        img.src = layer.src;
      });
    });

    Promise.all(imagePromises).then((loadedImages) => {
      const imageMap = new Map<string, HTMLImageElement>();
      loadedImages.forEach((item) => {
        if (item.img) imageMap.set(item.id, item.img);
      });

      sortedLayers.forEach((layer) => {
        if (layer.visible === false) return;

        ctx.save();
        ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;

        if (layer.type === 'rect') {
          const rectW = layer.width || 100;
          const rectH = layer.height || 100;
          const radius = layer.borderRadius || 0;

          if (layer.fill?.startsWith('linear-gradient')) {
            const gradient = ctx.createLinearGradient(0, layer.y, 0, layer.y + rectH);
            gradient.addColorStop(0, 'rgba(8, 46, 99, 0.88)');
            gradient.addColorStop(0.5, 'rgba(8, 46, 99, 0.4)');
            gradient.addColorStop(1, 'rgba(8, 46, 99, 0.96)');
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
        } else if (layer.type === 'text') {
          const fontSize = layer.fontSize || 32;
          const fontWeight = layer.fontWeight || '700';
          const fontFamily = layer.fontFamily || 'Montserrat, sans-serif';

          ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = layer.fill || '#FFFFFF';
          ctx.textBaseline = 'top';

          if (layer.textAlign === 'center') ctx.textAlign = 'center';
          else if (layer.textAlign === 'right') ctx.textAlign = 'right';
          else ctx.textAlign = 'left';

          ctx.fillText(layer.text || '', layer.x, layer.y);
        } else if (layer.type === 'image') {
          const img = imageMap.get(layer.id);
          if (img) {
            ctx.drawImage(img, layer.x, layer.y, layer.width || 1080, layer.height || 1920);
          }
        }

        ctx.restore();
      });

      const dataUrl = exportCanvas.toDataURL('image/png', 0.98);
      const downloadLink = document.createElement('a');
      downloadLink.download = `${heroDesign?.name?.replace(/\s+/g, '_') || 'Piertur_Creative'}_1080x1920.png`;
      downloadLink.href = dataUrl;
      downloadLink.click();
    });
  };

  if (!heroDesign) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 p-8 text-center">
          <p className="text-sm font-bold text-slate-500">Tasarım bulunamadı.</p>
          <button
            onClick={() => router.push('/wizard')}
            className="mt-4 bg-[#082E63] text-white px-6 py-2.5 rounded-xl text-xs font-bold"
          >
            Sıfırdan Oluştur
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Tasarımınız Hazır"
          subtitle="OpenAI Image Edit ve Piertur kurumsal reklam motoru ile 1080x1920 reklam kreatifi üretildi."
          showNewButton={true}
        />

        <AIGenerationLoadingModal isOpen={isRegenerating} />

        <main className="p-8 flex-1 max-w-4xl mx-auto w-full">
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

          {/* Top Info Header with Accurate AI Metadata Badge */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isTrueAi ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isTrueAi ? <Bot className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-extrabold text-[#082E63]">
                    Piertur Reklam Kreatifiniz Hazır
                  </h2>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                      isTrueAi
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    <Bot className="w-3 h-3 text-purple-600" />
                    <span>{isTrueAi ? `OpenAI Image Edit (${activeModel})` : 'Master Template Fallback'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full composite reklam önizlemesi. İndirmek için &quot;İndir&quot;, düzenlemek için &quot;Düzenle&quot; butonuna basın.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleRegenerateVariant}
                disabled={isRegenerating}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-700 to-[#082E63] hover:brightness-110 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#FFB21C]" />
                <span>AI İle Yeniden Üret</span>
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

          {/* Hero Preview Card for PRICE_HERO */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl transition-all flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#FFB21C]" />
                <h3 className="font-extrabold text-[#082E63] text-xl">
                  Uludağ Konaklamalı Tur — PRICE HERO
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {heroDesign.inputImageUsed && (
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full border bg-emerald-100 text-emerald-900 border-emerald-300 flex items-center gap-1">
                    <span>📸 Image Edit: EVET</span>
                  </span>
                )}
                <span className="text-xs font-bold text-[#0B63CE] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Story 1080x1920
                </span>
              </div>
            </div>

            {/* Hero Large 420px Composite Story Preview */}
            <div className="py-2 my-2">
              <LargeStoryPreview canvasData={heroDesign.canvasData} name={heroDesign.name} width={420} />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 w-full max-w-md space-y-3">
              <button
                type="button"
                onClick={() => router.push(`/studio/${heroDesign.id}`)}
                className="w-full bg-[#082E63] hover:bg-[#0B63CE] text-white py-4 rounded-xl font-extrabold text-sm shadow-md flex items-center justify-center space-x-2 transition-all transform hover:scale-102"
              >
                <Edit3 className="w-4 h-4 text-[#FFB21C]" />
                <span>BU TASARIMI CREATIVE STUDIO&apos;DA KULLAN</span>
              </button>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleExportPNG(heroDesign)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>İNDİR (PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/studio/${heroDesign.id}`)}
                  className="bg-slate-800 hover:bg-black text-white py-3 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>DÜZENLE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Film className="w-4 h-4" />
                  <span>HAREKET</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Video Motion Modal */}
      <VideoMotionModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} />
    </div>
  );
}
