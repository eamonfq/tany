import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, FileText, Calendar, Clock, DollarSign } from 'lucide-react';
import { invoicesApi } from '../../utils/api';
import {
  formatCurrency,
  formatDateShort,
  formatDateRelative,
  getStatusColor,
  getPaymentStatusIcon,
  getEventTypeIcon,
} from '../../utils/formatters';
import StatusBadge from '../../components/shared/StatusBadge';
import SearchInput from '../../components/shared/SearchInput';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';

const STATUS_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'Confirmada', label: 'Confirmada' },
  { key: 'En camino', label: 'En camino' },
  { key: 'Instalado', label: 'Instalado' },
  { key: 'Completada', label: 'Completada' },
  { key: 'Cancelada', label: 'Cancelada' },
];

const PAYMENT_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'Pendiente', label: 'Pendiente' },
  { key: 'Anticipo', label: 'Anticipo' },
  { key: 'Pagado', label: 'Pagado' },
];

export default function InvoiceList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const activeStatus = searchParams.get('status') || 'all';
  const activePayment = searchParams.get('payment') || 'all';

  useEffect(() => {
    loadInvoices();
  }, [activeStatus, activePayment]);

  async function loadInvoices() {
    try {
      setLoading(true);
      const params = {};
      if (activeStatus !== 'all') params.status = activeStatus;
      if (activePayment !== 'all') params.payment_status = activePayment;
      const res = await invoicesApi.getAll(params);
      setInvoices(res.data.data || res.data);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }

  function handleStatusFilter(key) {
    const params = {};
    if (key !== 'all') params.status = key;
    if (activePayment !== 'all') params.payment = activePayment;
    setSearchParams(params);
  }

  function handlePaymentFilter(key) {
    const params = {};
    if (activeStatus !== 'all') params.status = activeStatus;
    if (key !== 'all') params.payment = key;
    setSearchParams(params);
  }

  const filteredInvoices = invoices.filter((inv) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (inv.invoice_number || '').toLowerCase().includes(term) ||
      (inv.client_name || '').toLowerCase().includes(term) ||
      (inv.event_type || '').toLowerCase().includes(term) ||
      (inv.event_address || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas / Notas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {invoices.length} factura{invoices.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/invoices/new')}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Factura
        </button>
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por numero, cliente, tipo..."
      />

      {/* Status filter tabs */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 font-medium">Estado</p>
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeStatus === tab.key
                  ? 'bg-brand-pink text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payment filter tabs */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 font-medium">Pago</p>
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {PAYMENT_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handlePaymentFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activePayment === tab.key
                  ? 'bg-brand-pink text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.key !== 'all' && (
                <span className="mr-1">{getPaymentStatusIcon(tab.key)}</span>
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No hay facturas"
          description={
            activeStatus !== 'all' || activePayment !== 'all'
              ? 'No se encontraron facturas con los filtros seleccionados.'
              : 'Crea tu primera factura para comenzar.'
          }
          actionLabel="Nueva Factura"
          onAction={() => navigate('/invoices/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              onClick={() => navigate(`/invoices/${invoice.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-pink/30 transition-all cursor-pointer group"
            >
              {/* Top row: invoice number + status */}
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-brand-pink group-hover:text-brand-pink-dark transition-colors">
                    {invoice.invoice_number}
                  </p>
                  <p className="text-base font-semibold text-gray-900 mt-0.5 truncate">
                    {invoice.client_name}
                  </p>
                </div>
                <StatusBadge status={invoice.status} />
              </div>

              {/* Event info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                {invoice.event_date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDateShort(invoice.event_date)}
                  </span>
                )}
                {invoice.event_time && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} className="text-gray-400" />
                    {invoice.event_time}
                  </span>
                )}
                {invoice.event_type && (
                  <span className="inline-flex items-center gap-1">
                    <span>{getEventTypeIcon(invoice.event_type)}</span>
                    {invoice.event_type}
                  </span>
                )}
              </div>

              {/* Bottom row: total + payment status + created date */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(invoice.total)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(
                      invoice.payment_status
                    )}`}
                  >
                    {getPaymentStatusIcon(invoice.payment_status)} {invoice.payment_status}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDateRelative(invoice.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
