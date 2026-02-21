import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, FileText, Calendar, Clock } from 'lucide-react';
import { quotesApi } from '../../utils/api';
import { formatCurrency, formatDateShort, formatDateRelative, getStatusColor, getEventTypeIcon } from '../../utils/formatters';
import StatusBadge from '../../components/shared/StatusBadge';
import SearchInput from '../../components/shared/SearchInput';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';

const FILTER_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'Borrador', label: 'Borrador' },
  { key: 'Enviada', label: 'Enviada' },
  { key: 'Aceptada', label: 'Aceptada' },
  { key: 'Convertida', label: 'Convertida' },
  { key: 'Rechazada', label: 'Rechazada' },
];

export default function QuotesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const activeFilter = searchParams.get('status') || 'all';

  useEffect(() => {
    loadQuotes();
  }, [activeFilter]);

  async function loadQuotes() {
    try {
      setLoading(true);
      const params = {};
      if (activeFilter !== 'all') {
        params.status = activeFilter;
      }
      const res = await quotesApi.getAll(params);
      setQuotes(res.data);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key) {
    if (key === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ status: key });
    }
  }

  const filteredQuotes = quotes.filter((q) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (q.quote_number || '').toLowerCase().includes(term) ||
      (q.client_name || '').toLowerCase().includes(term) ||
      (q.event_type || '').toLowerCase().includes(term)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            {quotes.length} cotización{quotes.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/quotes/new')}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Cotización
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número, cliente o tipo..."
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleFilterChange(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === tab.key
                ? 'bg-brand-pink text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredQuotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No hay cotizaciones"
          description={
            activeFilter !== 'all'
              ? `No se encontraron cotizaciones con estado "${activeFilter}".`
              : 'Crea tu primera cotización para comenzar.'
          }
          actionLabel="Nueva Cotización"
          onAction={() => navigate('/quotes/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              onClick={() => navigate(`/quotes/${quote.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-pink/30 transition-all cursor-pointer group"
            >
              {/* Top row: quote number + status */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-brand-pink group-hover:text-brand-pink-dark transition-colors">
                    {quote.quote_number}
                  </p>
                  <p className="text-base font-semibold text-gray-900 mt-0.5">
                    {quote.client_name}
                  </p>
                </div>
                <StatusBadge status={quote.status} />
              </div>

              {/* Event info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                {quote.event_date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDateShort(quote.event_date)}
                  </span>
                )}
                {quote.event_type && (
                  <span className="inline-flex items-center gap-1">
                    <span>{getEventTypeIcon(quote.event_type)}</span>
                    {quote.event_type}
                  </span>
                )}
              </div>

              {/* Bottom row: total + created */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(quote.total)}
                </span>
                <span className="text-xs text-gray-400 inline-flex items-center gap-1">
                  <Clock size={12} />
                  {formatDateRelative(quote.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
