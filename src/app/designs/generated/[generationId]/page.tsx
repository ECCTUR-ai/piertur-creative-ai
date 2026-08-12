'use client';

import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DesignRepository } from '@/lib/storage/designRepository';
import { LargeStoryPreview } from '@/components/preview/LargeStoryPreview';
import { VideoMotionModal } from '@/components/studio/VideoMotionModal';
import { DesignModel } from '@/types';
import { Edit3, Download, Film, Sparkles, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { AIGenerationLoadingModal } from '@/components/wizard/AIGenerationLoadingModal';

export default function GeneratedDesignsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDebug = searchParams.get('debug') === 'true' || process.env.NODE_ENV === 'development';
  const generationId = params?.generationId as string;

  const [designs, setDesigns] = useState<DesignModel[]>(() => {
    return DesignRepository.getGenerationGroup(generationId);
  });

  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [_selectedDesignForMotion, setSelectedDesignForMotion] = useState<DesignModel | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Single Variant Regeneration handler
  const handleRegenerateVariant = async (targetDesign: DesignModel, index: number) => {
    if (regeneratingId) return;
    setRegeneratingId(targetDesign.id);
    setStatusNotice(null);

    try {
      const res = await fetch('/api/ai/generate-creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          singleVariantOnly: true,
          variant: targetDesign.variantType,
          payload: {
            campaignTitle: targetDesign.campaignData.title,
            subtitle: targetDesign.campaignData.subtitle,
            hotelName: targetDesign.campaignData.hotelName,
            nights: targetDesign.campaignData.nights,
            days: targetDesign.campaignData.days,
            boardType: targetDesign.campaignData.boardType,
            price: targetDesign.campaignData.price,
            currency: targetDesign.campaignData.currency,
            pricePrefix: targetDesign.campaignData.pricePrefix,
            priceSuffix: targetDesign.campaignData.priceSuffix,
            departureCities: targetDesign.campaignData.departureCities,
            benefits: targetDesign.campaignData.tags,
            campaignBadge: targetDesign.campaignData.badgeText,
            cta: targetDesign.campaignData.ctaText,
            website: targetDesign.campaignData.ctaUrl,
            uploadedImage: targetDesign.campaignData.backgroundImageUrl,
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
        const nextDesigns = [...designs];
        nextDesigns[index] = updatedVariant;
        setDesigns(nextDesigns);
        DesignRepository.saveGenerationGroup(generationId, nextDesigns);
      }
    } catch (e) {
      console.error('Variant Regeneration error', e);
      setStatusNotice('Tasarım oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setRegeneratingId(null);
    }
  };

  // High Resolution PNG Export engine
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
            if (layer.id === 'bg-overlay-top') {
              gradient.addColorStop(0, 'rgba(4, 20, 48, 0.65)');
              gradient.addColorStop(0.6, 'rgba(4, 20, 48, 0.2)');
              gradient.addColorStop(1, 'rgba(4, 20, 48, 0)');
            } else if (layer.id === 'bg-overlay-bottom') {
              gradient.addColorStop(0, 'rgba(4, 20, 48, 0)');
              gradient.addColorStop(0.35, 'rgba(4, 20, 48, 0.55)');
              gradient.addColorStop(1, 'rgba(4, 20, 48, 0.92)');
            } else {
              gradient.addColorStop(0, 'rgba(4, 20, 48, 0.6)');
              gradient.addColorStop(1, 'rgba(4, 20, 48, 0.9)');
            }
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
      downloadLink.download = `${design?.name?.replace(/\s+/g, '_') || 'Piertur_Creative'}_1080x1920.png`;
      downloadLink.href = dataUrl;
      downloadLink.click();
    });
  };

  if (!designs || designs.length === 0) {
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
          title="Tasarımlarınız Hazır"
          subtitle="OpenAI ve Piertur kurumsal reklam motoru ile 1080x1920 reklam kreatifleri üretildi."
          showNewButton={true}
        />

        <AIGenerationLoadingModal isOpen={!!regeneratingId} />

        <main className="p-8 flex-1 max-w-6xl mx-auto w-full">
          {/* Status Notice */}
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

          {/* Top Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#082E63]">
                Piertur Sosyal Medya Reklam Kreatifleriniz Hazır
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kullanmak istediğiniz tasarımı seçebilir, PNG indirebilir veya Creative Studio&apos;da özelleştirebilirsiniz.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/wizard')}
              className="flex items-center space-x-2 border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Yeni Kampanya Bilgileri Gir</span>
            </button>
          </div>

          {/* Render 3 Large Composite Preview Cards (or 1 Hero Card if single) */}
          <div
            className={`grid gap-8 ${
              designs.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' : 'grid-cols-1 md:grid-cols-3'
            }`}
          >
            {designs.map((design, index) => {
              const isTrueAi = design.generationSource === 'openai' && design.aiSuccess === true;

              return (
                <div
                  key={design.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl hover:shadow-2xl transition-all flex flex-col items-center justify-between"
                >
                  <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-[#FFB21C]" />
                      <h3 className="font-extrabold text-[#082E63] text-sm line-clamp-1">{design.name}</h3>
                    </div>

                    {isDebug && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300">
                        {isTrueAi ? 'OpenAI' : 'Fallback'}
                      </span>
                    )}
                  </div>

                  {/* Composite Preview */}
                  <div className="py-2 my-2 cursor-pointer" onClick={() => router.push(`/studio/${design.id}`)}>
                    <LargeStoryPreview canvasData={design.canvasData} name={design.name} width={340} />
                  </div>

                  {/* Actions */}
                  <div className="mt-6 w-full space-y-2.5">
                    <button
                      type="button"
                      onClick={() => router.push(`/studio/${design.id}`)}
                      className="w-full bg-[#082E63] hover:bg-[#0B63CE] text-white py-3 rounded-xl font-extrabold text-xs shadow-md flex items-center justify-center space-x-2 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#FFB21C]" />
                      <span>BU TASARIMI KULLAN</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleExportPNG(design)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-extrabold text-[11px] flex items-center justify-center space-x-1 transition-all shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>İNDİR (PNG)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRegenerateVariant(design, index)}
                        disabled={!!regeneratingId}
                        className="bg-purple-700 hover:bg-purple-800 text-white py-2.5 rounded-xl font-extrabold text-[11px] flex items-center justify-center space-x-1 transition-all disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#FFB21C]" />
                        <span>YENİDEN ÜRET</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/studio/${design.id}`)}
                        className="bg-slate-800 hover:bg-black text-white py-2 rounded-xl font-extrabold text-[11px] flex items-center justify-center space-x-1 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>DÜZENLE</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDesignForMotion(design);
                          setVideoModalOpen(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl font-extrabold text-[11px] flex items-center justify-center space-x-1 transition-all"
                      >
                        <Film className="w-3.5 h-3.5" />
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
