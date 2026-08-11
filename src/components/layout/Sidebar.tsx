'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  LayoutTemplate,
  Image as ImageIcon,
  Palette,
  Settings,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentPath?: string;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Yeni Tasarım',
      href: '/wizard',
      icon: PlusCircle,
      highlight: true,
    },
    {
      name: 'Tasarımlarım',
      href: '/designs',
      icon: FolderKanban,
    },
    {
      name: 'Şablonlar',
      href: '/templates',
      icon: LayoutTemplate,
    },
    {
      name: 'Medya Kütüphanesi',
      href: '/media',
      icon: ImageIcon,
    },
    {
      name: 'Marka Kiti',
      href: '/brand',
      icon: Palette,
    },
    {
      name: 'Ayarlar',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-[#082E63] text-white flex flex-col justify-between h-screen sticky top-0 border-r border-blue-900/40 shadow-xl z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-blue-900/50">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB21C] to-[#E31C24] flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5">
                PIERTUR
              </div>
              <div className="text-[10px] font-bold text-[#FFB21C] tracking-widest uppercase">
                Creative AI Studio
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

            if (item.highlight) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0B63CE] to-[#082E63] text-white font-semibold shadow-md hover:brightness-110 transition-all border border-blue-400/30 my-2"
                >
                  <Icon className="w-5 h-5 text-[#FFB21C]" />
                  <span>{item.name}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#FFB21C] pl-3'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FFB21C]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-4 m-3 rounded-xl bg-blue-950/60 border border-blue-800/40 text-center">
        <div className="text-xs font-semibold text-slate-300">Piertur Creative AI</div>
        <div className="text-[11px] text-[#FFB21C] font-mono mt-0.5">v0.1 MVP</div>
      </div>
    </aside>
  );
};
