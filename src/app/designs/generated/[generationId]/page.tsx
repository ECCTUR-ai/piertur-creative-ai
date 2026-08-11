'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DesignRepository } from '@/lib/storage/designRepository';
import { LargeStoryPreview } from '@/components/preview/LargeStoryPreview';
import { VideoMotionModal } from '@/components/studio/VideoMotionModal';
import { DesignModel } from '@/types';
import { Edit3, Download, Film, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function GeneratedDesignsPage() {
  const params = useParams();
  const router = useRouter();
  const generationId = params?.generationId as string;

  const [designs] = useState<DesignModel[]>(() => {
    return DesignRepository.getGenerationGroup(generationId);
  });

  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);

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
          subtitle="Kampanya bilgileriniz kullanılarak 3 farklı Piertur kreatifi oluşturuldu."
          showNewButton={true}
        />

        <main className="p-8 flex-1">
          {/* Top Info Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#082E63]">
                  3 Kurumsal Reklam Kreatifiniz Tamamlandı
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tasarımı indirmek için &quot;İndir&quot;, son düzenlemeler için &quot;Düzenle&quot; veya &quot;Bu Tasarımı Kullan&quot; butonuna basın.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/wizard')}
              className="flex items-center space-x-2 border border-slate-300 hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Yeni Bilgiler Gir</span>
            </button>
          </div>

          {/* 3 Large Previews Side-by-Side Grid (Desktop 3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {designs.map((design, idx) => (
              <div
                key={design.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
              >
                {/* Variant Header Title */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#FFB21C]" />
                    <h3 className="font-extrabold text-[#082E63] text-lg">
                      {getVariantTitle(idx)}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-[#0B63CE] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Story (1080x1920)
                  </span>
                </div>

                {/* Large 360px Story Preview Canvas */}
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

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportPNG(design)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1 transition-all shadow-xs"
                      title="Direkt Full Resolution PNG İndir"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>İNDİR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push(`/studio/${design.id}`)}
                      className="bg-slate-800 hover:bg-black text-white py-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1 transition-all"
                      title="Creative Studio'da Düzenle"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>DÜZENLE</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVideoModalOpen(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1 transition-all"
                      title="Video Animasyona Dönüştür"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>HAKETLENDİR</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Video Motion Modal */}
      <VideoMotionModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} />
    </div>
  );
}
