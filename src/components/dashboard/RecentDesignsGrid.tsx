'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit3, Copy, Download, Trash2, Calendar, Image as ImageIcon } from 'lucide-react';
import { DesignModel } from '@/types';
import { formatDate } from '@/lib/utils/formatters';
import { DesignRepository } from '@/lib/storage/designRepository';

interface RecentDesignsGridProps {
  designs: DesignModel[];
  onRefresh: () => void;
}

export const RecentDesignsGrid: React.FC<RecentDesignsGridProps> = ({ designs, onRefresh }) => {
  const router = useRouter();

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    DesignRepository.duplicate(id);
    onRefresh();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Bu tasarımı silmek istediğinize emin misiniz?')) {
      DesignRepository.delete(id);
      onRefresh();
    }
  };

  const handleDownload = (design: DesignModel, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/studio/${design.id}?autoDownload=true`);
  };

  if (designs.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-[#082E63] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-8 h-8 text-[#0B63CE]" />
        </div>
        <h3 className="text-lg font-bold text-[#082E63]">Henüz Tasarım Bulunmuyor</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
          İlk sosyal medya reklam görselinizi dakikalar içinde hazırlamak için hemen yeni tasarım oluşturun.
        </p>
        <Link
          href="/wizard"
          className="inline-flex items-center space-x-2 bg-[#082E63] hover:bg-[#0B63CE] text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all text-sm"
        >
          <span>+ Yeni Tasarım Oluştur</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-[#082E63]">Son Tasarımlar</h2>
          <p className="text-xs text-slate-500">Oluşturduğunuz reklam ve kampanya görselleri</p>
        </div>
        <Link
          href="/designs"
          className="text-xs font-bold text-[#0B63CE] hover:text-[#082E63] transition-colors"
        >
          Tümünü Gör →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {designs.map((design) => (
          <div
            key={design.id}
            className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
          >
            {/* Thumbnail Preview Area */}
            <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden flex items-center justify-center">
              {design.thumbnail ? (
                <img
                  src={design.thumbnail}
                  alt={design.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-slate-500 font-medium text-xs">Görsel Preview</div>
              )}

              {/* Format Pill Badge */}
              <div className="absolute top-3 left-3 bg-[#082E63]/90 backdrop-blur-md text-[#FFB21C] text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-400/30">
                {design.format === 'IG_STORY' ? 'Story (1080x1920)' : 'Post (1080x1350)'}
              </div>

              {/* Hover Quick Edit Action */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link
                  href={`/studio/${design.id}`}
                  className="bg-[#082E63] text-white hover:bg-[#0B63CE] px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Düzenle</span>
                </Link>
              </div>
            </div>

            {/* Meta & Info Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#082E63] line-clamp-1 group-hover:text-[#0B63CE] transition-colors">
                  {design.name}
                </h4>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(design.updatedAt)}</span>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-200/80 pt-3 mt-4">
                <Link
                  href={`/studio/${design.id}`}
                  className="text-xs font-bold text-[#082E63] hover:text-[#0B63CE] flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#0B63CE]" />
                  <span>Düzenle</span>
                </Link>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={(e) => handleDuplicate(design.id, e)}
                    className="p-1.5 text-slate-400 hover:text-[#082E63] hover:bg-slate-200/60 rounded-lg transition-colors"
                    title="Kopyala"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDownload(design, e)}
                    className="p-1.5 text-slate-400 hover:text-[#0B63CE] hover:bg-slate-200/60 rounded-lg transition-colors"
                    title="İndir"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(design.id, e)}
                    className="p-1.5 text-slate-400 hover:text-[#E31C24] hover:bg-rose-100/60 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
