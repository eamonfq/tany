import { Link } from 'react-router-dom';
import { Receipt, FileText, Activity } from 'lucide-react';
import { formatCurrency, formatDateRelative, getStatusColor } from '../../utils/formatters';

export default function RecentActivity({ activity }) {
  // API returns a flat array with doc_type field, or legacy { invoices, quotes } object
  let items;
  if (Array.isArray(activity)) {
    items = activity.map((item) => ({
      id: item.id,
      type: item.doc_type === 'invoice' ? 'invoice' : 'quote',
      number: item.number,
      client_name: item.client_name,
      total: item.total,
      status: item.status,
      date: item.created_at,
      link: item.doc_type === 'invoice' ? `/invoices/${item.id}` : `/quotes/${item.id}`,
    }));
  } else {
    items = [
      ...(activity.invoices || []).map((inv) => ({
        id: inv.id,
        type: 'invoice',
        number: inv.invoice_number,
        client_name: inv.client_name,
        total: inv.total,
        status: inv.status || inv.payment_status,
        date: inv.created_at || inv.event_date,
        link: `/invoices/${inv.id}`,
      })),
      ...(activity.quotes || []).map((q) => ({
        id: q.id,
        type: 'quote',
        number: q.quote_number,
        client_name: q.client_name,
        total: q.total,
        status: q.status,
        date: q.created_at,
        link: `/quotes/${q.id}`,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity size={20} className="text-brand-pink" />
          Actividad Reciente
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Activity size={40} className="mx-auto mb-2 opacity-50" />
          <p>No hay actividad reciente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              to={item.link}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div
                className={`p-2 rounded-lg flex-shrink-0 ${
                  item.type === 'invoice'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-purple-50 text-purple-600'
                }`}
              >
                {item.type === 'invoice' ? (
                  <Receipt size={16} />
                ) : (
                  <FileText size={16} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {item.number}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    {item.type === 'invoice' ? 'Nota' : 'Cotizacion'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {item.client_name}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.total)}
                </span>
                <div className="flex items-center gap-2">
                  {item.status && (
                    <span className={`badge ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-xs text-gray-400 hidden md:block flex-shrink-0 w-24 text-right">
                {formatDateRelative(item.date)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
