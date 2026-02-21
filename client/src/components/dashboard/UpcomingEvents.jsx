import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { formatDate, formatCurrency, getPaymentStatusIcon, getStatusColor } from '../../utils/formatters';

export default function UpcomingEvents({ events }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar size={20} className="text-brand-pink" />
          Proximos Eventos
        </h2>
        <Link to="/invoices" className="text-sm text-brand-pink hover:text-brand-pink-dark font-medium">
          Ver todos
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Calendar size={40} className="mx-auto mb-2 opacity-50" />
          <p>No hay eventos proximos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.slice(0, 5).map((event) => (
            <Link
              key={event.id}
              to={`/invoices/${event.id}`}
              className="block p-3 rounded-lg border border-gray-100 hover:border-brand-pink/30 hover:bg-pink-50/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">
                      {event.client_name}
                    </span>
                    {event.invoice_number && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {event.invoice_number}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(event.event_date)}
                    </span>
                    {event.event_time && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {event.event_time}
                      </span>
                    )}
                  </div>

                  {event.event_address && (
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-1 truncate">
                      <MapPin size={12} className="flex-shrink-0" />
                      <span className="truncate">{event.event_address}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(event.total)}
                  </span>
                  <span className={`badge ${getStatusColor(event.payment_status)}`}>
                    {getPaymentStatusIcon(event.payment_status)} {event.payment_status}
                  </span>
                  {event.status && (
                    <span className={`badge ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
