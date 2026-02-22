import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Package,
  X,
} from 'lucide-react';
import { invoicesApi, clientsApi, itemsApi, quotesApi } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import { EVENT_TYPES, CONTRACT_CONDITIONS } from '../../utils/constants';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ClientCombobox from '../../components/shared/ClientCombobox';

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromQuoteId = searchParams.get('from_quote');
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Form state
  const [form, setForm] = useState({
    client_id: '',
    client_name: '',
    client_phone: '',
    event_date: '',
    event_time: '',
    event_address: '',
    event_type: '',
    notes: '',
    conditions: CONTRACT_CONDITIONS.join('\n'),
    discount_percent: 0,
    advance_payment: 0,
  });

  // Items state
  const [items, setItems] = useState([]);
  const [showItemSearch, setShowItemSearch] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);

      const promises = [
        clientsApi.getAll(),
        itemsApi.getAll(),
      ];

      // If editing, load existing invoice
      if (isEditing) {
        promises.push(invoicesApi.getById(id));
      } else {
        // Get next invoice number for new invoices
        promises.push(invoicesApi.getNextNumber());
      }

      // If converting from quote, load quote data
      if (fromQuoteId) {
        promises.push(quotesApi.getById(fromQuoteId));
      }

      const results = await Promise.all(promises);
      const clientsData = results[0].data.data || results[0].data;
      const itemsData = results[1].data.data || results[1].data;

      setClients(Array.isArray(clientsData) ? clientsData : []);
      setCatalogItems(Array.isArray(itemsData) ? itemsData : []);

      if (isEditing) {
        const invoice = results[2].data.data || results[2].data;
        setInvoiceNumber(invoice.invoice_number || '');
        setForm({
          client_id: invoice.client_id || '',
          client_name: invoice.client_name || '',
          client_phone: invoice.client_phone || '',
          event_date: invoice.event_date ? invoice.event_date.split('T')[0] : '',
          event_time: invoice.event_time || '',
          event_address: invoice.event_address || '',
          event_type: invoice.event_type || '',
          notes: invoice.notes || '',
          conditions: invoice.conditions || CONTRACT_CONDITIONS.join('\n'),
          discount_percent: invoice.discount_percent || 0,
          advance_payment: invoice.advance_payment || 0,
        });
        setItems(
          (invoice.items || []).map((item, idx) => ({
            _key: `existing-${idx}`,
            item_id: item.item_id || '',
            description: item.description || '',
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
          }))
        );
      } else {
        const nextNumberData = results[2].data.data || results[2].data;
        setInvoiceNumber(
          typeof nextNumberData === 'string'
            ? nextNumberData
            : nextNumberData.next_number || nextNumberData.invoice_number || ''
        );

        // Pre-fill from quote if converting
        if (fromQuoteId && results[3]) {
          const quote = results[3].data.data || results[3].data;
          setForm((prev) => ({
            ...prev,
            client_id: quote.client_id || '',
            client_name: quote.client_name || '',
            client_phone: quote.client_phone || '',
            event_date: quote.event_date ? quote.event_date.split('T')[0] : '',
            event_time: quote.event_time || '',
            event_address: quote.event_address || '',
            event_type: quote.event_type || '',
            notes: quote.notes || '',
            discount_percent: quote.discount_percent || 0,
          }));
          setItems(
            (quote.items || []).map((item, idx) => ({
              _key: `quote-${idx}`,
              item_id: item.item_id || '',
              description: item.description || '',
              quantity: item.quantity || 1,
              unit_price: item.unit_price || 0,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    return subtotal * (Number(form.discount_percent) / 100);
  }, [subtotal, form.discount_percent]);

  const total = useMemo(() => {
    return subtotal - discountAmount;
  }, [subtotal, discountAmount]);

  const remaining = useMemo(() => {
    return Math.max(0, total - Number(form.advance_payment));
  }, [total, form.advance_payment]);

  // Client selection
  function handleClientChange(clientId) {
    const client = clients.find((c) => String(c.id) === String(clientId));
    if (client) {
      setForm((prev) => ({
        ...prev,
        client_id: client.id,
        client_name: client.name,
        client_phone: client.phone || '',
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        client_id: '',
        client_name: '',
        client_phone: '',
      }));
    }
  }

  // Item management
  function addItemFromCatalog(catalogItem) {
    setItems((prev) => [
      ...prev,
      {
        _key: `cat-${Date.now()}-${Math.random()}`,
        item_id: catalogItem.id,
        description: catalogItem.name,
        quantity: 1,
        unit_price: catalogItem.unit_price || 0,
      },
    ]);
    setShowItemSearch(false);
    setItemSearchTerm('');
  }

  function addCustomItem() {
    setItems((prev) => [
      ...prev,
      {
        _key: `custom-${Date.now()}-${Math.random()}`,
        item_id: '',
        description: '',
        quantity: 1,
        unit_price: 0,
      },
    ]);
  }

  function updateItem(key, field, value) {
    setItems((prev) =>
      prev.map((item) =>
        item._key === key ? { ...item, [field]: value } : item
      )
    );
  }

  function removeItem(key) {
    setItems((prev) => prev.filter((item) => item._key !== key));
  }

  // Filter catalog items for search
  const filteredCatalogItems = useMemo(() => {
    if (!itemSearchTerm.trim()) return catalogItems;
    const term = itemSearchTerm.toLowerCase();
    return catalogItems.filter(
      (item) =>
        (item.name || '').toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term)
    );
  }, [catalogItems, itemSearchTerm]);

  // Form submission
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.client_id) {
      alert('Selecciona un cliente');
      return;
    }
    if (!form.event_date) {
      alert('La fecha del evento es requerida');
      return;
    }
    if (!form.event_address) {
      alert('La direccion del evento es requerida');
      return;
    }
    if (items.length === 0) {
      alert('Agrega al menos un articulo');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        invoice_number: invoiceNumber,
        items: items.map(({ _key, ...rest }) => ({
          ...rest,
          line_total: rest.quantity * rest.unit_price,
        })),
        subtotal,
        discount_amount: discountAmount,
        total,
        remaining_payment: remaining,
        advance_payment: Number(form.advance_payment),
        discount_percent: Number(form.discount_percent),
        payment_status:
          Number(form.advance_payment) >= total
            ? 'Pagado'
            : Number(form.advance_payment) > 0
            ? 'Anticipo'
            : 'Pendiente',
        from_quote: fromQuoteId || undefined,
      };

      if (isEditing) {
        await invoicesApi.update(id, payload);
      } else {
        await invoicesApi.create(payload);
      }

      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error al guardar la factura');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Factura' : 'Nueva Factura'}
          </h1>
          {invoiceNumber && (
            <p className="text-sm text-brand-pink font-semibold mt-0.5">
              {invoiceNumber}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Section */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Cliente</h2>

          <div>
            <label className="label">Cliente *</label>
            <ClientCombobox
              clients={clients}
              value={form.client_id}
              onChange={handleClientChange}
            />
          </div>

          {form.client_name && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">{form.client_name}</p>
              {form.client_phone && (
                <p className="text-sm text-gray-500">{form.client_phone}</p>
              )}
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Datos del Evento</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha del evento *</label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Hora</label>
              <input
                type="time"
                value={form.event_time}
                onChange={(e) => setForm((f) => ({ ...f, event_time: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Direccion del evento *</label>
            <input
              type="text"
              value={form.event_address}
              onChange={(e) => setForm((f) => ({ ...f, event_address: e.target.value }))}
              className="input-field"
              placeholder="Calle, numero, colonia, ciudad..."
              required
            />
          </div>

          <div>
            <label className="label">Tipo de evento</label>
            <select
              value={form.event_type}
              onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value }))}
              className="input-field"
            >
              <option value="">Seleccionar tipo...</option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Section */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Articulos</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowItemSearch(true)}
                className="btn-secondary text-sm inline-flex items-center gap-1"
              >
                <Search size={14} />
                Del catalogo
              </button>
              <button
                type="button"
                onClick={addCustomItem}
                className="btn-secondary text-sm inline-flex items-center gap-1"
              >
                <Plus size={14} />
                Personalizado
              </button>
            </div>
          </div>

          {/* Item search modal */}
          {showItemSearch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => {
                  setShowItemSearch(false);
                  setItemSearchTerm('');
                }}
              />
              <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Agregar del catalogo</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemSearch(false);
                      setItemSearchTerm('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="relative mb-3">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={itemSearchTerm}
                    onChange={(e) => setItemSearchTerm(e.target.value)}
                    placeholder="Buscar articulo..."
                    className="input-field pl-9"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto flex-1 space-y-1">
                  {filteredCatalogItems.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No se encontraron articulos
                    </p>
                  ) : (
                    filteredCatalogItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addItemFromCatalog(item)}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-brand-pink/10 flex items-center justify-center shrink-0">
                          <Package size={16} className="text-brand-pink" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400">{item.category}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 shrink-0">
                          {formatCurrency(item.unit_price)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Items list */}
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Agrega articulos a la factura</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item._key}
                  className="bg-gray-50 rounded-lg p-3 space-y-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item._key, 'description', e.target.value)
                        }
                        placeholder="Descripcion del articulo"
                        className="input-field text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item._key)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-400">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item._key,
                            'quantity',
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Precio unitario</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(
                            item._key,
                            'unit_price',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Total</label>
                      <p className="input-field text-sm bg-gray-100 flex items-center font-semibold">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subtotal */}
          {items.length > 0 && (
            <div className="border-t pt-3 text-right">
              <span className="text-sm text-gray-500">Subtotal: </span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
          )}
        </div>

        {/* Discount */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Descuento</h2>
          <div className="flex items-center gap-3">
            <div className="w-32">
              <label className="label">Porcentaje %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.discount_percent}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    discount_percent: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
                  }))
                }
                className="input-field"
              />
            </div>
            {Number(form.discount_percent) > 0 && (
              <div className="pt-5">
                <span className="text-sm text-red-600">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Section */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Pago</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Total</label>
              <p className="input-field bg-gray-100 font-bold text-lg text-brand-pink">
                {formatCurrency(total)}
              </p>
            </div>
            <div>
              <label className="label">Anticipo</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.advance_payment}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    advance_payment: parseFloat(e.target.value) || 0,
                  }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Restante</label>
              <p className="input-field bg-gray-100 font-bold text-amber-600">
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Notas</h2>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="input-field"
            placeholder="Notas adicionales..."
          />
        </div>

        {/* Conditions */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Condiciones del cliente</h2>
          <textarea
            value={form.conditions}
            onChange={(e) => setForm((f) => ({ ...f, conditions: e.target.value }))}
            rows={5}
            className="input-field text-sm"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-8"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
