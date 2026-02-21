export function formatWhatsAppNumber(phone) {
  let clean = phone.replace(/\D/g, '');
  if (!clean.startsWith('52')) {
    clean = '52' + clean;
  }
  return clean;
}

export function generateWhatsAppLink(phone, message) {
  const number = formatWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

export function openWhatsApp(phone, message) {
  const link = generateWhatsAppLink(phone, message);
  window.open(link, '_blank');
}

export function fillTemplate(template, data) {
  let message = template;
  const replacements = {
    '{nombre}': data.nombre || data.name || '',
    '{fecha_evento}': data.fecha_evento || data.event_date || '',
    '{horario}': data.horario || data.event_time || '',
    '{direccion}': data.direccion || data.event_address || '',
    '{total}': data.total || '',
    '{anticipo}': data.anticipo || data.advance_payment || '',
    '{restante}': data.restante || data.remaining_payment || '',
    '{anticipo_sugerido}': data.anticipo_sugerido || '',
    '{articulos}': data.articulos || '',
    '{special_date_label}': data.special_date_label || '',
    '{link_reseña}': data.link_resena || 'https://g.page/eventostany',
    '{pendiente_pago}': data.pendiente_pago || '',
  };

  Object.entries(replacements).forEach(([key, value]) => {
    message = message.split(key).join(String(value));
  });

  return message;
}

export function formatPhoneDisplay(phone) {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }
  return phone;
}
