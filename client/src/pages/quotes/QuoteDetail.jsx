import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  MessageCircle,
  ArrowRightLeft,
  ChevronDown,
  Phone,
  User,
} from 'lucide-react';
import { quotesApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { QUOTE_STATUSES, LOGO_URL, CONTRACT_CONDITIONS } from '../../utils/constants';
import { openWhatsApp, formatPhoneDisplay } from '../../utils/whatsapp';
import { generatePDF } from '../../utils/pdfGenerator';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { useToast } from '../../components/shared/Toast';

export default function QuoteDetailPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const { id } = useParams();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [advancePayment, setAdvancePayment] = useState(0);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    loadQuote();
  }, [id]);

  async function loadQuote() {
    try {
      setLoading(true);
      const res = await quotesApi.getById(id);
      setQuote(res.data);
      // Default advance to 30% of total
      setAdvancePayment(Math.round((res.data.total || 0) * 0.3));
    } catch (error) {
      console.error('Error loading quote:', error);
      navigate('/quotes');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      await quotesApi.updateStatus(id, newStatus);
      setQuote((prev) => ({ ...prev, status: newStatus }));
      setShowStatusDropdown(false);
      toast.success('Estado actualizado a ' + newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  }

  async function handleDelete() {
    try {
      await quotesApi.delete(id);
      toast.success('Cotizacion eliminada');
      navigate('/quotes');
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Error al eliminar la cotizacion');
    }
  }

  async function handleConvert() {
    setConverting(true);
    try {
      const res = await quotesApi.convert(id, { advance_payment: Number(advancePayment) });
      const invoiceId = res.data.id || res.data.invoice_id;
      setShowConvertModal(false);
      toast.success('Cotizacion convertida a factura');
      navigate(`/invoices/${invoiceId}`);
    } catch (error) {
      console.error('Error converting quote:', error);
      toast.error('Error al convertir la cotizacion');
    } finally {
      setConverting(false);
    }
  }

  function handleWhatsApp() {
    if (!quote || !quote.client_phone) return;

    const itemsList = (quote.items || [])
      .map((i) => `  * ${i.quantity}x ${i.description} - ${formatCurrency(i.quantity * i.unit_price)}`)
      .join('\n');

    const message = [
      `*COTIZACION ${quote.quote_number}*`,
      `Eventos Tany`,
      ``,
      `Cliente: ${quote.client_name}`,
      quote.event_date ? `Fecha evento: ${formatDate(quote.event_date)}` : '',
      quote.event_time ? `Hora: ${quote.event_time}` : '',
      quote.event_address ? `Lugar: ${quote.event_address}` : '',
      ``,
      `*Articulos:*`,
      itemsList,
      ``,
      `*Total: ${formatCurrency(quote.total)}*`,
      quote.discount_percent > 0 ? `(Incluye ${quote.discount_percent}% de descuento)` : '',
      ``,
      quote.valid_until ? `Vigencia: ${formatDate(quote.valid_until)}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    openWhatsApp(quote.client_phone, message);
  }

  function handleDownloadPDF() {
    generatePDF('quote-preview', `${quote.quote_number}.pdf`);
  }

  const canConvert = quote && (quote.status === 'Aceptada' || quote.status === 'Enviada');
  const remainingPayment = (quote?.total || 0) - (Number(advancePayment) || 0);

  if (loading) return <LoadingSpinner />;
  if (!quote) return null;

  const subtotal = (quote.items || []).reduce(
    (sum, i) => sum + (i.quantity || 0) * (i.unit_price || 0),
    0
  );
  const discountAmount = (subtotal * (quote.discount_percent || 0)) / 100;

  return (
    <div>
      {/* Back button */}
      <div className="mb-4 no-print">
        <Link
          to="/quotes"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Cotizaciones
        </Link>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={quote.status} className="text-sm" />

          <div className="flex-1" />

          {/* WhatsApp */}
          {quote.client_phone && (
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-colors"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">Enviar por WhatsApp</span>
            </button>
          )}

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Descargar PDF</span>
          </button>

          {/* Convert to Invoice */}
          {canConvert && (
            <button
              onClick={() => setShowConvertModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors"
            >
              <ArrowRightLeft size={16} />
              <span className="hidden sm:inline">Convertir a Factura</span>
            </button>
          )}

          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Cambiar Estado
              <ChevronDown size={14} />
            </button>
            {showStatusDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowStatusDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  {QUOTE_STATUSES.filter((s) => s !== quote.status).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Edit */}
          <button
            onClick={() => navigate(`/quotes/${id}/edit`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <Edit size={16} />
            <span className="hidden sm:inline">Editar</span>
          </button>

          {/* Delete */}
          {isAdmin && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* QUOTE PREVIEW - THE BEAUTIFUL DOCUMENT                             */}
      {/* ================================================================== */}
      <div
        id="quote-preview"
        className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      >
        {/* ─── Header Band ─── */}
        <div className="invoice-header-footer px-8 py-6" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
          <div className="flex items-start justify-between">
            <div>
              {!logoError ? (
                <img
                  src={LOGO_URL}
                  alt="Eventos Tany"
                  className="h-12 mb-2"
                  crossOrigin="anonymous"
                  style={{ filter: 'brightness(0) invert(1)' }}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <h2 className="text-2xl font-bold tracking-wide mb-1">EVENTOS TANY</h2>
              )}
              <p className="text-xs" style={{ opacity: 0.85 }}>Renta de inflables y mobiliario</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-widest" style={{ opacity: 0.85 }}>
                Cotizacion
              </p>
              <p className="text-xl font-bold mt-1">{quote.quote_number}</p>
            </div>
          </div>
        </div>

        {/* ─── Date Row ─── */}
        <div className="px-8 py-3 border-b border-gray-300 flex items-center justify-between" style={{ backgroundColor: '#f3f4f6' }}>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">Fecha: </span>
            {formatDate(quote.created_at)}
          </p>
          {quote.valid_until && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">Vigencia: </span>
              {formatDate(quote.valid_until)}
            </p>
          )}
        </div>

        {/* ─── Client Section ─── */}
        <div className="px-8 py-5 border-b border-gray-300">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
            Cliente
          </h3>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-gray-800">
              <User size={15} className="text-gray-400 flex-shrink-0" />
              <span className="font-semibold">{quote.client_name}</span>
            </div>
            {quote.client_phone && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone size={15} className="text-gray-400 flex-shrink-0" />
                <span>{formatPhoneDisplay(quote.client_phone)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── Event Details Section ─── */}
        {(quote.event_date || quote.event_time || quote.event_address || quote.event_type) && (
          <div className="px-8 py-5 border-b border-gray-300">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
              Datos del Evento
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              {quote.event_date && (
                <p>
                  <span className="font-semibold text-gray-900">Fecha:</span>{' '}
                  {formatDate(quote.event_date)}
                </p>
              )}
              {quote.event_time && (
                <p>
                  <span className="font-semibold text-gray-900">Hora:</span>{' '}
                  {quote.event_time}
                </p>
              )}
              {quote.event_address && (
                <p className="col-span-2">
                  <span className="font-semibold text-gray-900">Direccion:</span>{' '}
                  {quote.event_address}
                </p>
              )}
              {quote.event_type && (
                <p>
                  <span className="font-semibold text-gray-900">Tipo:</span>{' '}
                  {quote.event_type}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ─── Items Table ─── */}
        <div className="px-8 py-5 border-b border-gray-300">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th className="text-left py-2.5 px-3 font-semibold text-gray-900 border border-gray-300 w-16">
                  Cant.
                </th>
                <th className="text-left py-2.5 px-3 font-semibold text-gray-900 border border-gray-300">
                  Descripcion
                </th>
                <th className="text-right py-2.5 px-3 font-semibold text-gray-900 border border-gray-300 w-28">
                  P. Unitario
                </th>
                <th className="text-right py-2.5 px-3 font-semibold text-gray-900 border border-gray-300 w-28">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {(quote.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-3 text-gray-700 border border-gray-300 text-center">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-3 text-gray-900 border border-gray-300">
                    {item.description}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-700 border border-gray-300">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-gray-900 border border-gray-300">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mt-4">
            <div className="w-64 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {quote.discount_percent > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Descuento ({quote.discount_percent}%)</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-gray-900">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(quote.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Notes (if any) ─── */}
        {quote.notes && (
          <div className="px-8 py-4 border-b border-gray-300">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Notas
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{quote.notes}</p>
          </div>
        )}

        {/* ─── Terms & Conditions ─── */}
        <div className="px-8 py-5 border-b border-gray-300">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-300 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-0.5">Vigencia de cotizacion</p>
              <p className="text-sm font-semibold text-gray-900">
                {quote.valid_until ? formatDate(quote.valid_until) : '15 dias'}
              </p>
            </div>
            <div className="border border-gray-300 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-0.5">Anticipo sugerido (30%)</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency((quote.total || 0) * 0.3)}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Condiciones
            </p>
            {CONTRACT_CONDITIONS.map((condition, idx) => (
              <p key={idx} className="text-xs text-gray-500 leading-relaxed">
                {idx + 1}. {condition}
              </p>
            ))}
          </div>
        </div>

        {/* ─── Brand Footer ─── */}
        <div className="invoice-header-footer px-8 py-3 text-center" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
          <p className="font-medium text-xs">
            Eventos Tany | Tel: (452) 123-5725 | Instagram: @eventostany
          </p>
          </div>
        </div>

      {/* ================================================================== */}
      {/* MODALS                                                              */}
      {/* ================================================================== */}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar cotización"
        message={`¿Estás seguro de eliminar la cotización ${quote.quote_number}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Convert to Invoice Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowConvertModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Convertir a Factura</h3>
            <p className="text-sm text-gray-500 mb-5">
              Se creará una factura a partir de esta cotización ({quote.quote_number}).
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total de la cotización
                </label>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(quote.total)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anticipo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    min="0"
                    max={quote.total}
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(e.target.value)}
                    className="input-field w-full pl-7 text-lg"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Anticipo</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(Number(advancePayment) || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-gray-900">
                  <span>Restante</span>
                  <span className="text-amber-600">
                    {formatCurrency(remainingPayment > 0 ? remainingPayment : 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConvertModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleConvert}
                disabled={converting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors disabled:opacity-50"
              >
                <ArrowRightLeft size={16} />
                {converting ? 'Convirtiendo...' : 'Convertir a Factura'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
