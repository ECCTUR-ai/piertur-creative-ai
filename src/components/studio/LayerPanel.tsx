'use client';

import React from 'react';
import { CanvasLayer } from '@/types';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Trash2,
  Layers,
  Type,
  Square,
  Image as ImageIcon,
} from 'lucide-react';

interface LayerPanelProps {
  layers: CanvasLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayers: (layers: CanvasLayer[]) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayers,
}) => {
  // Order layers from top (highest zIndex) to bottom
  const sortedLayers = [...layers].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

  const handleToggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = layers.map((layer) =>
      layer.id === id ? { ...layer, visible: layer.visible === false ? true : false } : layer
    );
    onUpdateLayers(updated);
  };

  const handleToggleLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = layers.map((layer) =>
      layer.id === id ? { ...layer, locked: !layer.locked } : layer
    );
    onUpdateLayers(updated);
  };

  const handleMoveUp = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = sortedLayers.findIndex((l) => l.id === id);
    if (idx <= 0) return; // Already on top

    const targetLayer = sortedLayers[idx];
    const upperLayer = sortedLayers[idx - 1];

    const targetZ = targetLayer.zIndex || 0;
    const upperZ = upperLayer.zIndex || 0;

    const updated = layers.map((l) => {
      if (l.id === targetLayer.id) return { ...l, zIndex: upperZ + 1 };
      if (l.id === upperLayer.id) return { ...l, zIndex: targetZ };
      return l;
    });

    onUpdateLayers(updated);
  };

  const handleMoveDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = sortedLayers.findIndex((l) => l.id === id);
    if (idx < 0 || idx >= sortedLayers.length - 1) return; // Already on bottom

    const targetLayer = sortedLayers[idx];
    const lowerLayer = sortedLayers[idx + 1];

    const targetZ = targetLayer.zIndex || 0;
    const lowerZ = lowerLayer.zIndex || 0;

    const updated = layers.map((l) => {
      if (l.id === targetLayer.id) return { ...l, zIndex: lowerZ - 1 };
      if (l.id === lowerLayer.id) return { ...l, zIndex: targetZ };
      return l;
    });

    onUpdateLayers(updated);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = layers.filter((l) => l.id !== id);
    onUpdateLayers(filtered);
    if (selectedLayerId === id) onSelectLayer(null);
  };

  return (
    <div className="p-4 studio-scroll overflow-y-auto max-h-full space-y-2 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#FFB21C]" />
          <h3 className="font-extrabold text-sm text-white">Katman Sistemi</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono font-bold">{layers.length} katman</span>
      </div>

      {sortedLayers.map((layer) => {
        const isSelected = selectedLayerId === layer.id;

        return (
          <div
            key={layer.id}
            onClick={() => onSelectLayer(layer.id)}
            className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all ${
              isSelected
                ? 'bg-[#0B63CE]/30 border-[#0B63CE] text-white shadow-md'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2.5 truncate flex-1 pr-2">
              <div className="text-slate-400">
                {layer.type === 'text' && <Type className="w-4 h-4 text-[#FFB21C]" />}
                {layer.type === 'rect' && <Square className="w-4 h-4 text-[#0B63CE]" />}
                {layer.type === 'image' && <ImageIcon className="w-4 h-4 text-emerald-400" />}
              </div>

              <div className="truncate">
                <span className="text-xs font-bold block truncate">{layer.name}</span>
                {layer.text && (
                  <span className="text-[10px] text-slate-400 truncate block">&quot;{layer.text}&quot;</span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={(e) => handleMoveUp(layer.id, e)}
                className="p-1 text-slate-400 hover:text-white rounded-md"
                title="Öne Getir"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => handleMoveDown(layer.id, e)}
                className="p-1 text-slate-400 hover:text-white rounded-md"
                title="Arkaya Gönder"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => handleToggleVisibility(layer.id, e)}
                className="p-1 text-slate-400 hover:text-white rounded-md"
                title={layer.visible === false ? 'Göster' : 'Gizle'}
              >
                {layer.visible === false ? (
                  <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-300" />
                )}
              </button>
              <button
                type="button"
                onClick={(e) => handleToggleLock(layer.id, e)}
                className="p-1 text-slate-400 hover:text-white rounded-md"
                title={layer.locked ? 'Kilidi Aç' : 'Kilitle'}
              >
                {layer.locked ? (
                  <Lock className="w-3.5 h-3.5 text-[#FFB21C]" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              <button
                type="button"
                onClick={(e) => handleDelete(layer.id, e)}
                className="p-1 text-slate-400 hover:text-rose-400 rounded-md"
                title="Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
