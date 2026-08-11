/**
 * Utility functions for Piertur Creative AI
 */

export function formatPrice(price: number): string {
  if (isNaN(price) || price === null || price === undefined) return '0';
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatCurrencySymbol(currency: 'TL' | 'EUR' | 'USD'): string {
  switch (currency) {
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'TL':
    default:
      return 'TL';
  }
}

export function formatDuration(nights: number, days?: number): string {
  if (days && days > 0) {
    return `${nights} Gece ${days} Gün`;
  }
  return `${nights} Gece Otel Konaklamalı`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function generateId(): string {
  return 'piertur_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}
