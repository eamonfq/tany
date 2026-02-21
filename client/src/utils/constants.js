export const ITEM_CATEGORIES = [
  'Brincolines',
  'Mesas',
  'Sillas',
  'Manteles',
  'CubreManteles',
  'Otros',
];

export const CLIENT_STATUSES = [
  'Prospecto',
  'Cotizado',
  'Confirmado',
  'Completado',
];

export const QUOTE_STATUSES = [
  'Borrador',
  'Enviada',
  'Aceptada',
  'Convertida',
  'Rechazada',
  'Vencida',
];

export const INVOICE_STATUSES = [
  'Confirmada',
  'En camino',
  'Instalado',
  'Evento en curso',
  'Recogido',
  'Completada',
  'Cancelada',
];

export const PAYMENT_STATUSES = [
  'Pendiente',
  'Anticipo',
  'Pagado',
];

export const EVENT_TYPES = [
  'Cumpleaños',
  'Bautizo',
  'XV Años',
  'Boda',
  'Comunión',
  'Escolar',
  'Otro',
];

export const CLIENT_SOURCES = [
  'WhatsApp',
  'Facebook',
  'Instagram',
  'Referido',
  'Otro',
];

export const REMINDER_TYPES = [
  { value: 'pre_event', label: 'Antes del evento' },
  { value: 'follow_up_quote', label: 'Seguimiento cotización' },
  { value: 'follow_up_prospect', label: 'Seguimiento prospecto' },
  { value: 'post_event', label: 'Post evento' },
  { value: 'special_date', label: 'Fecha especial' },
  { value: 'recontact', label: 'Re-contactar' },
  { value: 'payment', label: 'Pago pendiente' },
  { value: 'custom', label: 'Personalizado' },
];

export const PRIORITY_OPTIONS = [
  { value: 'Alta', label: 'Alta', color: 'text-red-600' },
  { value: 'Normal', label: 'Normal', color: 'text-yellow-600' },
  { value: 'Baja', label: 'Baja', color: 'text-gray-500' },
];

export const CONTRACT_CONDITIONS = [
  'El pago del 100% del servicio de renta de inflable y mobiliario se realiza el día del evento al dejarlo instalado, o si se realizó un anticipo, deberá ser liquidado en ese momento.',
  'Al término del contrato el cliente es responsable de entregar el inflable y/o mobiliario al personal de EVENTOS TANY completo y en buenas condiciones.',
  'En caso de algún daño o pérdida el cliente deberá pagar el total o importe acordado de acuerdo al mismo.',
];

export const LOGO_URL = 'https://eventostany.com/wp-content/uploads/2025/06/logo_eventos_tany.png';
