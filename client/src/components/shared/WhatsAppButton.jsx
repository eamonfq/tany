import { MessageCircle } from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';

export default function WhatsAppButton({ phone, message = '', size = 'md', label, className = '' }) {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const iconSizes = { sm: 14, md: 16, lg: 20 };

  return (
    <button
      onClick={() => openWhatsApp(phone, message)}
      className={`inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors ${sizes[size]} ${className}`}
    >
      <MessageCircle size={iconSizes[size]} />
      {label && <span>{label}</span>}
    </button>
  );
}
