'use client';

import React from 'react';
import { CanvasLayer } from '@/types';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
} from 'lucide-react';

interface PropertyInspectorProps {
  selectedLayer: CanvasLayer | null;
  onUpdateLayer: (layer: CanvasLayer) => void;
}

const BRAND_SWATCHES = ['#FFFFFF', '#082E63', '#0B63CE', '#FFB21C', '#E31C24', '#0F172A', '#000000'];

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  selectedLayer,
  onUpdateLayer,
}) => {
  if (!selectedLayer) {
    return (
      <div className="p-6 text-center text-slate-400 flex flex-col items-center justify-center h-full">
        <Sliders className="w-10 h-10 text-slate-600 mb-3" />
        <h4 className="font-bold text-sm text-slate-300">Öğe Seçilmedi</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Özelliklerini değiştirmek istediğiniz metin veya şekle canvas üzerinden tıklayın.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 studio-scroll overflow-y-auto max-h-full text-slate-200">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFB21C]">
            {selectedLayer.type} ÖĞESİ
          </span>
          <h3 className="font-extrabold text-sm text-white">{selectedLayer.name}</h3>
        </div>
      </div>

      {/* TEXT PROPERTIES */}
      {selectedLayer.type === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Metin</label>
            <textarea
              value={selectedLayer.text || ''}
              onChange={(e) => onUpdateLayer({ ...selectedLayer, text: e.target.value })}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#0B63CE]"
            />
          </div>

          {/* Font Family & Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Font Size (px)
              </label>
              <input
                type="number"
                value={selectedLayer.fontSize || 32}
                onChange={(e) =>
                  onUpdateLayer({ ...selectedLayer, fontSize: parseInt(e.target.value) || 12 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#0B63CE]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Font Weight
              </label>
              <select
                value={selectedLayer.fontWeight || '700'}
                onChange={(e) =>
                  onUpdateLayer({
                    ...selectedLayer,
                    fontWeight: e.target.value,
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#0B63CE]"
              >
                <option value="normal">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">SemiBold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">ExtraBold (800)</option>
              </select>
            </div>
          </div>

          {/* Alignment & Weight Quick Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Hizalama
            </label>
            <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => onUpdateLayer({ ...selectedLayer, textAlign: 'left' })}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center ${
                  selectedLayer.textAlign === 'left' || !selectedLayer.textAlign
                    ? 'bg-[#0B63CE] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateLayer({ ...selectedLayer, textAlign: 'center' })}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center ${
                  selectedLayer.textAlign === 'center'
                    ? 'bg-[#0B63CE] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateLayer({ ...selectedLayer, textAlign: 'right' })}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center ${
                  selectedLayer.textAlign === 'right'
                    ? 'bg-[#0B63CE] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Metin Rengi
            </label>
            <div className="flex items-center space-x-3 mb-2">
              <input
                type="color"
                value={selectedLayer.fill || '#FFFFFF'}
                onChange={(e) => onUpdateLayer({ ...selectedLayer, fill: e.target.value })}
                className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-slate-300">
                {selectedLayer.fill || '#FFFFFF'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {BRAND_SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => onUpdateLayer({ ...selectedLayer, fill: hex })}
                  className="w-6 h-6 rounded-full border border-slate-600 shadow-sm"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SHAPE PROPERTIES */}
      {selectedLayer.type === 'rect' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Arka Plan Rengi
            </label>
            <div className="flex items-center space-x-3 mb-2">
              <input
                type="color"
                value={
                  selectedLayer.fill?.startsWith('#') ? selectedLayer.fill : '#082E63'
                }
                onChange={(e) => onUpdateLayer({ ...selectedLayer, fill: e.target.value })}
                className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-slate-300">
                {selectedLayer.fill}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {BRAND_SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => onUpdateLayer({ ...selectedLayer, fill: hex })}
                  className="w-6 h-6 rounded-full border border-slate-600"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Köşe Yuvarlama (Radius)
              </label>
              <input
                type="number"
                value={selectedLayer.borderRadius || 0}
                onChange={(e) =>
                  onUpdateLayer({
                    ...selectedLayer,
                    borderRadius: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Çerçeve Kalınlığı
              </label>
              <input
                type="number"
                value={selectedLayer.strokeWidth || 0}
                onChange={(e) =>
                  onUpdateLayer({
                    ...selectedLayer,
                    strokeWidth: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* COMMON OPACITY SLIDER */}
      <div className="border-t border-slate-700/80 pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Saydamlık (Opacity)</label>
          <span className="text-xs font-mono text-[#FFB21C]">
            {Math.round((selectedLayer.opacity !== undefined ? selectedLayer.opacity : 1) * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={selectedLayer.opacity !== undefined ? selectedLayer.opacity : 1}
          onChange={(e) =>
            onUpdateLayer({ ...selectedLayer, opacity: parseFloat(e.target.value) })
          }
          className="w-full accent-[#0B63CE]"
        />
      </div>

      {/* POSITION X/Y */}
      <div className="grid grid-cols-2 gap-3 border-t border-slate-700/80 pt-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Pozisyon X</label>
          <input
            type="number"
            value={selectedLayer.x}
            onChange={(e) =>
              onUpdateLayer({ ...selectedLayer, x: parseInt(e.target.value) || 0 })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Pozisyon Y</label>
          <input
            type="number"
            value={selectedLayer.y}
            onChange={(e) =>
              onUpdateLayer({ ...selectedLayer, y: parseInt(e.target.value) || 0 })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
          />
        </div>
      </div>
    </div>
  );
};
