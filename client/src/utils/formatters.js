import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

// SQLite CURRENT_TIMESTAMP stores UTC without 'Z' suffix.
// parseISO treats strings without timezone as local time, causing offset issues.
// This helper ensures UTC strings are parsed correctly.
function parseDate(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr !== 'string') return dateStr;
  // If it has no timezone indicator (Z or +/-), append Z to treat as UTC
  const trimmed = dateStr.trim();
  if (!/[Z+\-]\d{0,4}$/.test(trimmed) && /\d{2}:\d{2}/.test(trimmed)) {
    return parseISO(trimmed.replace(' ', 'T') + 'Z');
  }
  return parseISO(trimmed);
}

export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseDate(dateStr) : dateStr;
    if (!isValid(date)) return dateStr;
    return format(date, "d 'de' MMMM yyyy", { locale: es });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseDate(dateStr) : dateStr;
    if (!isValid(date)) return dateStr;
    return format(date, 'dd/MM/yyyy', { locale: es });
  } catch {
    return dateStr;
  }
}

export function formatDateRelative(dateStr) {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseDate(dateStr) : dateStr;
    if (!isValid(date)) return dateStr;
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } catch {
    return dateStr;
  }
}

export function formatDateDay(dateStr) {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseDate(dateStr) : dateStr;
    if (!isValid(date)) return dateStr;
    return format(date, "EEEE d 'de' MMMM", { locale: es });
  } catch {
    return dateStr;
  }
}

export function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

export function isPast(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
}

export function isFuture(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr > today;
}

export function getStatusColor(status) {
  const colors = {
    // Client statuses
    'Prospecto': 'bg-gray-100 text-gray-600',
    'Cotizado': 'bg-blue-100 text-blue-700',
    'Confirmado': 'bg-amber-100 text-amber-700',
    'Completado': 'bg-green-100 text-green-700',
    // Quote statuses
    'Borrador': 'bg-gray-100 text-gray-600',
    'Enviada': 'bg-blue-100 text-blue-700',
    'Aceptada': 'bg-green-100 text-green-700',
    'Convertida': 'bg-purple-100 text-purple-700',
    'Rechazada': 'bg-red-100 text-red-700',
    'Vencida': 'bg-orange-100 text-orange-700',
    // Invoice statuses
    'Confirmada': 'bg-blue-100 text-blue-700',
    'En camino': 'bg-yellow-100 text-yellow-700',
    'Instalado': 'bg-indigo-100 text-indigo-700',
    'Evento en curso': 'bg-purple-100 text-purple-700',
    'Recogido': 'bg-teal-100 text-teal-700',
    'Completada': 'bg-green-100 text-green-700',
    'Cancelada': 'bg-red-100 text-red-700',
    // Payment statuses
    'Pendiente': 'bg-red-100 text-red-700',
    'Anticipo': 'bg-amber-100 text-amber-700',
    'Pagado': 'bg-green-100 text-green-700',
    // Reminder statuses
    'Enviado': 'bg-green-100 text-green-700',
    'Descartado': 'bg-gray-100 text-gray-500',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
}

export function getPaymentStatusIcon(status) {
  const icons = {
    'Pendiente': '🔴',
    'Anticipo': '🟡',
    'Pagado': '🟢',
  };
  return icons[status] || '';
}

export function getReminderTypeLabel(type) {
  const labels = {
    'pre_event': 'Antes del evento',
    'follow_up_quote': 'Seguimiento cotización',
    'follow_up_prospect': 'Seguimiento prospecto',
    'post_event': 'Post evento',
    'special_date': 'Fecha especial',
    'recontact': 'Re-contactar',
    'payment': 'Pago pendiente',
    'custom': 'Personalizado',
  };
  return labels[type] || type;
}

export function getReminderTypeIcon(type) {
  const icons = {
    'pre_event': '📅',
    'follow_up_quote': '📋',
    'follow_up_prospect': '👋',
    'post_event': '🎉',
    'special_date': '🎂',
    'recontact': '🔄',
    'payment': '💰',
    'custom': '📝',
  };
  return icons[type] || '🔔';
}

export function getEventTypeIcon(type) {
  const icons = {
    'Cumpleaños': '🎂',
    'Bautizo': '⛪',
    'XV Años': '👑',
    'Boda': '💒',
    'Comunión': '✝️',
    'Escolar': '🏫',
    'Otro': '🎉',
  };
  return icons[type] || '🎉';
}
