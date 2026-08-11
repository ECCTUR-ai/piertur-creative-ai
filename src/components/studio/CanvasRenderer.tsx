'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CanvasData, CanvasLayer } from '@/types';

interface CanvasRendererProps {
  canvasData: CanvasData;
  zoom: number; // 0.5, 0.75, 1.0, or fit scale float
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (updatedLayer: CanvasLayer) => void;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  canvasData,
  zoom,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Native Story resolution
  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = 1920;

  // Render Canvas Elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background color
    ctx.fillStyle = canvasData.backgroundColor || '#082E63';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Sort elements by zIndex
    const sortedLayers = [...canvasData.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // Render layers
    sortedLayers.forEach((layer) => {
      if (layer.visible === false) return;

      ctx.save();
      ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;

      if (layer.type === 'rect') {
        renderRect(ctx, layer);
      } else if (layer.type === 'text') {
        renderText(ctx, layer);
      } else if (layer.type === 'image' && layer.src) {
        renderImage(ctx, layer);
      }

      ctx.restore();
    });

    // Render Selection Box for Selected Layer
    if (selectedLayerId) {
      const selected = canvasData.elements.find((el) => el.id === selectedLayerId);
      if (selected && selected.visible !== false) {
        const bounds = getLayerBounds(ctx, selected);
        ctx.save();
        ctx.strokeStyle = '#FFB21C';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(bounds.x - 6, bounds.y - 6, bounds.width + 12, bounds.height + 12);

        // Selection Handles
        ctx.fillStyle = '#0B63CE';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        const handles = [
          { x: bounds.x - 6, y: bounds.y - 6 },
          { x: bounds.x + bounds.width + 6, y: bounds.y - 6 },
          { x: bounds.x - 6, y: bounds.y + bounds.height + 6 },
          { x: bounds.x + bounds.width + 6, y: bounds.y + bounds.height + 6 },
        ];
        handles.forEach((h) => {
          ctx.beginPath();
          ctx.arc(h.x, h.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        ctx.restore();
      }
    }
  }, [canvasData, selectedLayerId]);

  // Helper functions for rendering
  function renderRect(ctx: CanvasRenderingContext2D, layer: CanvasLayer) {
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
  }

  function renderText(ctx: CanvasRenderingContext2D, layer: CanvasLayer) {
    const fontSize = layer.fontSize || 32;
    const fontWeight = layer.fontWeight || '700';
    const fontFamily = layer.fontFamily || 'Montserrat, sans-serif';

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = layer.fill || '#FFFFFF';
    ctx.textBaseline = 'top';

    if (layer.textAlign === 'center') {
      ctx.textAlign = 'center';
    } else if (layer.textAlign === 'right') {
      ctx.textAlign = 'right';
    } else {
      ctx.textAlign = 'left';
    }

    ctx.fillText(layer.text || '', layer.x, layer.y);
  }

  function renderImage(ctx: CanvasRenderingContext2D, layer: CanvasLayer) {
    if (!layer.src) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = layer.src;

    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, layer.x, layer.y, layer.width || 1080, layer.height || 1920);
    } else {
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext('2d');
          if (context) {
            context.drawImage(img, layer.x, layer.y, layer.width || 1080, layer.height || 1920);
          }
        }
      };
    }
  }

  function getLayerBounds(ctx: CanvasRenderingContext2D, layer: CanvasLayer) {
    if (layer.type === 'text') {
      ctx.font = `${layer.fontWeight || '700'} ${layer.fontSize || 32}px ${
        layer.fontFamily || 'Montserrat, sans-serif'
      }`;
      const metrics = ctx.measureText(layer.text || '');
      const width = metrics.width;
      const height = layer.fontSize || 32;
      let x = layer.x;
      if (layer.textAlign === 'center') x -= width / 2;
      if (layer.textAlign === 'right') x -= width;
      return { x, y: layer.y, width, height };
    }
    return {
      x: layer.x,
      y: layer.y,
      width: layer.width || 200,
      height: layer.height || 100,
    };
  }

  // Pointer Down Handle Selection & Dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Find clicked layer (top-most zIndex first)
    const sortedLayers = [...canvasData.elements]
      .filter((l) => l.visible !== false && !l.locked)
      .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    const clicked = sortedLayers.find((layer) => {
      const bounds = getLayerBounds(ctx, layer);
      return (
        clickX >= bounds.x &&
        clickX <= bounds.x + bounds.width &&
        clickY >= bounds.y &&
        clickY <= bounds.y + bounds.height
      );
    });

    if (clicked) {
      onSelectLayer(clicked.id);
      setIsDragging(true);
      setDragOffset({
        x: clickX - clicked.x,
        y: clickY - clicked.y,
      });
    } else {
      onSelectLayer(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedLayerId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const layer = canvasData.elements.find((l) => l.id === selectedLayerId);
    if (layer && !layer.locked) {
      onUpdateLayer({
        ...layer,
        x: Math.round(mouseX - dragOffset.x),
        y: Math.round(mouseY - dragOffset.y),
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center p-8 overflow-auto studio-scroll select-none"
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
        className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-slate-950"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="cursor-crosshair block"
          style={{ width: '450px', height: '800px' }}
        />
      </div>
    </div>
  );
};
