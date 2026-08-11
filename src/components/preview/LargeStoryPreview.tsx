'use client';

import React, { useEffect, useRef } from 'react';
import { CanvasData } from '@/types';

interface LargeStoryPreviewProps {
  canvasData: CanvasData;
  name: string;
  width?: number; // Default ~360px
}

export const LargeStoryPreview: React.FC<LargeStoryPreviewProps> = ({ canvasData, width = 360 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const NATIVE_WIDTH = 1080;
  const NATIVE_HEIGHT = 1920;
  const height = Math.round((width * 1920) / 1080);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    // Background color
    ctx.fillStyle = canvasData.backgroundColor || '#082E63';
    ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    // Sort elements by zIndex
    const sortedLayers = [...canvasData.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

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
      } else if (layer.type === 'image' && layer.src) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, layer.x, layer.y, layer.width || 1080, layer.height || 1920);
        };
        img.src = layer.src;
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, layer.x, layer.y, layer.width || 1080, layer.height || 1920);
        }
      }

      ctx.restore();
    });
  }, [canvasData]);

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 mx-auto"
    >
      <canvas
        ref={canvasRef}
        width={NATIVE_WIDTH}
        height={NATIVE_HEIGHT}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="block"
      />
    </div>
  );
};
