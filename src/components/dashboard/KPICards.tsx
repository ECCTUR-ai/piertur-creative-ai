'use client';

import React from 'react';
import { Layers, Calendar, Camera, LayoutGrid } from 'lucide-react';
import { DesignModel } from '@/types';

interface KPICardsProps {
  designs: DesignModel[];
}

export const KPICards: React.FC<KPICardsProps> = ({ designs }) => {
  const totalCount = designs.length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthCount = designs.filter((d) => {
    const date = new Date(d.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const storyCount = designs.filter((d) => d.format === 'IG_STORY').length;
  const postCount = designs.filter((d) => d.format === 'IG_POST' || d.format === 'SQUARE_POST').length;

  const kpis = [
    {
      title: 'Toplam Tasarım',
      value: totalCount,
      icon: Layers,
      color: 'bg-blue-50 text-[#082E63]',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Bu Ay Oluşturulan',
      value: thisMonthCount,
      icon: Calendar,
      color: 'bg-amber-50 text-[#FFB21C]',
      borderColor: 'border-amber-100',
    },
    {
      title: 'Story Tasarımları',
      value: storyCount,
      icon: Camera,
      color: 'bg-indigo-50 text-[#0B63CE]',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Post Tasarımları',
      value: postCount,
      icon: LayoutGrid,
      color: 'bg-rose-50 text-[#E31C24]',
      borderColor: 'border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <div
            key={i}
            className={`bg-white rounded-2xl p-6 border ${kpi.borderColor} shadow-sm hover:shadow-md transition-shadow flex items-center justify-between`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {kpi.title}
              </p>
              <h3 className="text-3xl font-extrabold text-[#082E63] mt-2">{kpi.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
