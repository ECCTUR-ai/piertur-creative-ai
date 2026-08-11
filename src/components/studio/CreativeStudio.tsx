'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Film,
  LayoutTemplate,
  Type,
  Image as ImageIcon,
  Square,
  Palette,
  ChevronDown,
  Sliders,
  Layers,
} from 'lucide-react';
import { DesignModel, CanvasLayer, CanvasData } from '@/types';
import { DesignRepository } from '@/lib/storage/designRepository';
import { templatesList } from '@/lib/templates';
import { generateId } from '@/lib/utils/formatters';
import { CanvasRenderer } from './CanvasRenderer';
import { PropertyInspector } from './PropertyInspector';
import { LayerPanel } from './LayerPanel';
import { VideoMotionModal } from './VideoMotionModal';

interface CreativeStudioProps {
  initialDesign: DesignModel;
  autoDownload?: boolean;
}

export const CreativeStudio: React.FC<CreativeStudioProps> = ({
  initialDesign,
  autoDownload = false,
}) => {
  const router = useRouter();
  const [design, setDesign] = useState<DesignModel>(initialDesign);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<'templates' | 'text' | 'media' | 'elements' | 'brand'>(
    'templates'
  );
  const [rightTab, setRightTab] = useState<'properties' | 'layers'>('properties');
  const [zoom, setZoom] = useState<number>(0.5); // Default fit zoom scale float
  const [saveStatus, setSaveStatus] = useState<string>('Tüm değişiklikler kaydedildi');
  const [exportDropdownOpen, setExportDropdownOpen] = useState<boolean>(false);
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save logic on canvas state changes
  const updateDesignCanvasData = (newCanvasData: CanvasData) => {
    const updated = { ...design, canvasData: newCanvasData };
    setDesign(updated);

    setSaveStatus('Kaydediliyor...');

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      DesignRepository.save(updated);
      setSaveStatus('Tüm değişiklikler kaydedildi');
    }, 800);
  };

  // Single Layer update handler
  const handleUpdateLayer = (updatedLayer: CanvasLayer) => {
    const newElements = design.canvasData.elements.map((l) =>
      l.id === updatedLayer.id ? updatedLayer : l
    );
    updateDesignCanvasData({
      ...design.canvasData,
      elements: newElements,
    });
  };

  // Layers list update handler
  const handleUpdateLayers = (newLayers: CanvasLayer[]) => {
    updateDesignCanvasData({
      ...design.canvasData,
      elements: newLayers,
    });
  };

  // Add new layer
  const handleAddTextLayer = (presetText: string, fontSize: number, fontWeight: string, color: string) => {
    const newId = generateId();
    const maxZ = Math.max(...design.canvasData.elements.map((l) => l.zIndex || 0), 0);

    const newLayer: CanvasLayer = {
      id: newId,
      name: presetText.substring(0, 20),
      type: 'text',
      x: 200,
      y: 500,
      text: presetText,
      fontSize,
      fontWeight,
      fontFamily: 'Montserrat, sans-serif',
      fill: color,
      textAlign: 'center',
      visible: true,
      locked: false,
      zIndex: maxZ + 1,
    };

    updateDesignCanvasData({
      ...design.canvasData,
      elements: [...design.canvasData.elements, newLayer],
    });
    setSelectedLayerId(newId);
  };

  // Apply template onto current campaign info
  const handleApplyTemplate = (templateId: string) => {
    const tpl = templatesList.find((t) => t.id === templateId);
    if (!tpl) return;

    const newCanvas = tpl.generateCanvasData(design.campaignData);
    updateDesignCanvasData(newCanvas);
  };

  // High Resolution Export Function (1080x1920)
  const handleExport = (format: 'PNG' | 'JPG') => {
    setExportDropdownOpen(false);

    // Create an offscreen high-res canvas at exactly 1080x1920
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1080;
    exportCanvas.height = 1920;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = design.canvasData.backgroundColor || '#082E63';
    ctx.fillRect(0, 0, 1080, 1920);

    // Sort elements by zIndex
    const sortedLayers = [...design.canvasData.elements].sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
    );

    const renderPromises = sortedLayers.map((layer) => {
      return new Promise<void>((resolve) => {
        if (layer.visible === false) return resolve();

        ctx.save();
        ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;

        if (layer.type === 'rect') {
          const width = layer.width || 100;
          const height = layer.height || 100;
          const radius = layer.borderRadius || 0;

          if (layer.fill?.startsWith('linear-gradient')) {
            const gradient = ctx.createLinearGradient(0, layer.y, 0, layer.y + height);
            gradient.addColorStop(0, 'rgba(8, 46, 99, 0.95)');
            gradient.addColorStop(0.5, 'rgba(8, 46, 99, 0.5)');
            gradient.addColorStop(1, 'rgba(8, 46, 99, 0.98)');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = layer.fill || '#082E63';
          }

          ctx.beginPath();
          if (radius > 0 && ctx.roundRect) {
            ctx.roundRect(layer.x, layer.y, width, height, radius);
          } else {
            ctx.rect(layer.x, layer.y, width, height);
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
      const mime = format === 'PNG' ? 'image/png' : 'image/jpeg';
      const dataUrl = exportCanvas.toDataURL(mime, 0.98);

      const downloadLink = document.createElement('a');
      downloadLink.download = `${design.name.replace(/\s+/g, '_')}_1080x1920.${format.toLowerCase()}`;
      downloadLink.href = dataUrl;
      downloadLink.click();
    });
  };

  useEffect(() => {
    if (autoDownload) {
      setTimeout(() => {
        handleExport('PNG');
      }, 500);
    }
  }, [autoDownload]);

  const selectedLayer = design.canvasData.elements.find((l) => l.id === selectedLayerId) || null;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-white overflow-hidden select-none">
      {/* CREATIVE STUDIO TOP BAR */}
      <header className="h-16 bg-[#082E63] border-b border-blue-900/60 px-6 flex items-center justify-between shrink-0 z-30 shadow-md">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Dashboard&apos;a Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <input
              type="text"
              value={design.name}
              onChange={(e) => {
                const updated = { ...design, name: e.target.value };
                setDesign(updated);
                DesignRepository.save(updated);
              }}
              className="bg-transparent font-bold text-sm text-white focus:outline-none focus:bg-white/10 px-2 py-1 rounded-lg border border-transparent hover:border-blue-400/40"
            />
            <div className="text-[10px] text-[#FFB21C] flex items-center gap-1 font-semibold ml-2">
              <span>{saveStatus}</span>
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-bold mr-2">Zoom:</span>
          {[
            { label: '50%', val: 0.5 },
            { label: '75%', val: 0.75 },
            { label: '100%', val: 1.0 },
          ].map((z) => (
            <button
              key={z.label}
              type="button"
              onClick={() => setZoom(z.val)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                zoom === z.val ? 'bg-[#0B63CE] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>

        {/* Action Buttons: Motion & Download */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setVideoModalOpen(true)}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-[#FFB21C] border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Film className="w-4 h-4 text-[#FFB21C]" />
            <span>Hareketlendir</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#0B63CE] to-[#E31C24] hover:brightness-110 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>İndir</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                <button
                  type="button"
                  onClick={() => handleExport('PNG')}
                  className="w-full px-4 py-3 text-left text-xs font-bold hover:bg-slate-800 flex items-center justify-between"
                >
                  <span>PNG Yüksek Kalite</span>
                  <span className="text-[10px] text-[#FFB21C] font-mono">1080x1920</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('JPG')}
                  className="w-full px-4 py-3 text-left text-xs font-bold hover:bg-slate-800 border-t border-slate-800 flex items-center justify-between"
                >
                  <span>JPG Formatı</span>
                  <span className="text-[10px] text-slate-400 font-mono">1080x1920</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3-COLUMN STUDIO LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: SIDEBAR TABS & TOOLBOX */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-20">
          {/* Tab Navigation Header */}
          <div className="flex items-center justify-around bg-slate-950 border-b border-slate-800 p-2">
            {[
              { id: 'templates', label: 'Şablonlar', icon: LayoutTemplate },
              { id: 'text', label: 'Metin', icon: Type },
              { id: 'media', label: 'Fotoğraf', icon: ImageIcon },
              { id: 'elements', label: 'Öğeler', icon: Square },
              { id: 'brand', label: 'Marka', icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = leftTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLeftTab(tab.id as typeof leftTab)}
                  className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[#082E63] text-[#FFB21C] font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] mt-1 font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Left Toolbox Content */}
          <div className="flex-1 p-5 studio-scroll overflow-y-auto">
            {/* TEMPLATES TAB */}
            {leftTab === 'templates' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-[#FFB21C]" />
                  <span>Şablon Kütüphanesi</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tıkladığınız şablon kampanya bilgileriniz korunarak uygulanır.
                </p>

                <div className="space-y-3">
                  {templatesList.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => handleApplyTemplate(tpl.id)}
                      className="cursor-pointer rounded-xl border border-slate-800 hover:border-[#0B63CE] bg-slate-950 overflow-hidden group transition-all flex items-center p-3 gap-3"
                    >
                      <img
                        src={tpl.thumbnailUrl}
                        alt={tpl.name}
                        className="w-14 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-white group-hover:text-[#FFB21C]">
                          {tpl.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{tpl.tagline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TEXT TAB */}
            {leftTab === 'text' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Type className="w-4 h-4 text-[#FFB21C]" />
                  <span>Metin Ekle</span>
                </h3>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleAddTextLayer('YENİ BAŞLIK EKLENDİ', 64, '800', '#FFFFFF')
                    }
                    className="w-full bg-slate-800 hover:bg-[#082E63] p-4 rounded-xl text-left border border-slate-700 font-extrabold text-lg text-white transition-all"
                  >
                    + Büyük Başlık Ekle
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleAddTextLayer('Alt Başlık Metni', 36, '600', '#FFB21C')
                    }
                    className="w-full bg-slate-800 hover:bg-[#082E63] p-3 rounded-xl text-left border border-slate-700 font-bold text-sm text-[#FFB21C] transition-all"
                  >
                    + Alt Başlık Ekle
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleAddTextLayer('25.249 TL', 80, '800', '#FFFFFF')
                    }
                    className="w-full bg-slate-800 hover:bg-[#082E63] p-3 rounded-xl text-left border border-slate-700 font-black text-xl text-emerald-400 transition-all"
                  >
                    + Fiyat Etiketi Ekle
                  </button>
                </div>
              </div>
            )}

            {/* MEDIA TAB */}
            {leftTab === 'media' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#FFB21C]" />
                  <span>Fotoğraf Değiştir</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=800&q=80',
                  ].map((url, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        const updatedElements = design.canvasData.elements.map((l) =>
                          l.type === 'image' ? { ...l, src: url } : l
                        );
                        updateDesignCanvasData({
                          ...design.canvasData,
                          elements: updatedElements,
                        });
                      }}
                      className="cursor-pointer aspect-[9/16] rounded-xl overflow-hidden border border-slate-800 hover:border-[#0B63CE] group"
                    >
                      <img
                        src={url}
                        alt="Media"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BRAND KIT TAB */}
            {leftTab === 'brand' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#FFB21C]" />
                  <span>Piertur Marka Kiti</span>
                </h3>

                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold">Ana Lacivert</span>
                    <span className="font-mono text-xs text-[#082E63] font-extrabold bg-[#082E63] px-2 py-1 rounded text-white">
                      #082E63
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold">Piertur Mavi</span>
                    <span className="font-mono text-xs font-extrabold bg-[#0B63CE] px-2 py-1 rounded text-white">
                      #0B63CE
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold">Gold Altın</span>
                    <span className="font-mono text-xs font-extrabold bg-[#FFB21C] px-2 py-1 rounded text-[#082E63]">
                      #FFB21C
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold">Kırmızı Vurgu</span>
                    <span className="font-mono text-xs font-extrabold bg-[#E31C24] px-2 py-1 rounded text-white">
                      #E31C24
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: INTERACTIVE CANVAS WORKSPACE */}
        <CanvasRenderer
          canvasData={design.canvasData}
          zoom={zoom}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onUpdateLayer={handleUpdateLayer}
        />

        {/* RIGHT COLUMN: PROPERTY INSPECTOR & LAYER SYSTEM */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-20">
          {/* Inspector vs Layers Tab Toggle */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950">
            <button
              type="button"
              onClick={() => setRightTab('properties')}
              className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
                rightTab === 'properties'
                  ? 'border-[#FFB21C] text-[#FFB21C] bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Özellikler</span>
            </button>
            <button
              type="button"
              onClick={() => setRightTab('layers')}
              className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
                rightTab === 'layers'
                  ? 'border-[#FFB21C] text-[#FFB21C] bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Katmanlar</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {rightTab === 'properties' ? (
              <PropertyInspector
                selectedLayer={selectedLayer}
                onUpdateLayer={handleUpdateLayer}
              />
            ) : (
              <LayerPanel
                layers={design.canvasData.elements}
                selectedLayerId={selectedLayerId}
                onSelectLayer={setSelectedLayerId}
                onUpdateLayers={handleUpdateLayers}
              />
            )}
          </div>
        </div>
      </div>

      {/* Motion Video Modal */}
      <VideoMotionModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} />
    </div>
  );
};
