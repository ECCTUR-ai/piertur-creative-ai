import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Piertur Creative AI - Sosyal Medya Reklam Tasarım Studio',
  description: 'Piertur için sosyal medya reklam görsellerini dakikalar içinde hızlı şekilde üreten reklam tasarım editörü.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full bg-slate-50 antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
