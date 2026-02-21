import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { clientsApi } from '../../utils/api';
import { formatDateRelative } from '../../utils/formatters';
import { formatPhoneDisplay } from '../../utils/whatsapp';
import { CLIENT_STATUSES } from '../../utils/constants';
import StatusBadge from '../../components/shared/StatusBadge';
import WhatsAppButton from '../../components/shared/WhatsAppButton';
import SearchInput from '../../components/shared/SearchInput';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';

const STATUS_TABS = ['Todos', ...CLIENT_STATUSES];

export default function ClientList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('Todos');

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeStatus !== 'Todos') params.status = activeStatus;
      if (search.trim()) params.search = search.trim();
      const { data } = await clientsApi.getAll(params);
      setClients(data.data || data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [activeStatus, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchClients();
    }, search ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [fetchClients, search]);

  const sourceLabels = {
    WhatsApp: 'via WhatsApp',
    Facebook: 'via Facebook',
    Instagram: 'via Instagram',
    Referido: 'via Referido',
    Otro: 'via Otro',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <span className="badge bg-gray-100 text-gray-600">
            {clients.length}
          </span>
        </div>
        <button
          onClick={() => navigate('/clients/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nuevo Cliente</span>
        </button>
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre o telefono..."
      />

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeStatus === status
                ? 'bg-brand-pink text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Client Cards */}
      {loading ? (
        <LoadingSpinner />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No se encontraron clientes"
          description={
            search || activeStatus !== 'Todos'
              ? 'Intenta con otros filtros de busqueda'
              : 'Agrega tu primer cliente para comenzar'
          }
          actionLabel={!search && activeStatus === 'Todos' ? '+ Nuevo Cliente' : undefined}
          onAction={!search && activeStatus === 'Todos' ? () => navigate('/clients/new') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => navigate(`/clients/${client.id}`)}
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 truncate">
                    {client.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatPhoneDisplay(client.phone)}
                  </p>
                </div>
                <StatusBadge status={client.status} />
              </div>

              {client.source && (
                <p className="text-xs text-gray-400 mb-1">
                  {sourceLabels[client.source] || `via ${client.source}`}
                </p>
              )}

              {client.last_contact && (
                <p className="text-xs text-gray-400 mb-1">
                  Ultimo contacto: {formatDateRelative(client.last_contact)}
                </p>
              )}

              {client.special_date && (
                <p className="text-xs text-amber-600 mb-1">
                  {'\uD83C\uDF82'} {client.special_date_label || 'Fecha especial'} -{' '}
                  {new Date(client.special_date).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              )}

              {client.notes && (
                <p className="text-xs text-gray-400 mb-2 truncate">
                  {client.notes.length > 60
                    ? client.notes.slice(0, 60) + '...'
                    : client.notes}
                </p>
              )}

              <div className="flex justify-end mt-2">
                <WhatsAppButton
                  phone={client.phone}
                  size="sm"
                  label="WhatsApp"
                  className=""
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
