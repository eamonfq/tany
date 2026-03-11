import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  ChevronDown,
  CreditCard,
  X,
} from 'lucide-react';
import { invoicesApi } from '../../utils/api';
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getPaymentStatusIcon,
} from '../../utils/formatters';
import { formatPhoneDisplay } from '../../utils/whatsapp';
import { generatePDF } from '../../utils/pdfGenerator';
import { INVOICE_STATUSES, CONTRACT_CONDITIONS, LOGO_URL } from '../../utils/constants';
import StatusBadge from '../../components/shared/StatusBadge';
import WhatsAppButton from '../../components/shared/WhatsAppButton';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { useToast } from '../../components/shared/Toast';

// Status flow for the step-through dropdown
const STATUS_FLOW = [
  'Confirmada',
  'En camino',
  'Instalado',
  'Evento en curso',
  'Recogido',
  'Completada',
];

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Payment modal state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('anticipo');
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  async function loadInvoice() {
    try {
      setLoading(true);
      const res = await invoicesApi.getById(id);
      const data = res.data.data || res.data;
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      await invoicesApi.updateStatus(id, newStatus);
      setInvoice((prev) => ({ ...prev, status: newStatus }));
      setShowStatusDropdown(false);
      toast.success('Estado actualizado a ' + newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  }

  async function handlePaymentSubmit() {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      toast.warning('Ingresa un monto valido');
      return;
    }
    setSavingPayment(true);
    try {
      await invoicesApi.updatePayment(id, {
        amount: Number(paymentAmount),
        type: paymentType,
      });
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentType('anticipo');
      await loadInvoice();
      toast.success('Pago registrado correctamente');
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Error al registrar el pago');
    } finally {
      setSavingPayment(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await invoicesApi.delete(id);
      toast.success('Factura eliminada');
      navigate('/invoices');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Error al eliminar la factura');
    } finally {
      setDeleting(false);
    }
  }

  function handleDownloadPDF() {
    if (!invoice) return;
    const filename = `${invoice.invoice_number || 'factura'}.pdf`;
    generatePDF('invoice-preview', filename);
  }

  function buildWhatsAppMessage() {
    if (!invoice) return '';
    const items = (invoice.items || [])
      .map((item) => `  - ${item.quantity}x ${item.description}: ${formatCurrency(item.line_total)}`)
      .join('\n');

    return (
      `*CONTRATO DE RENTA ${invoice.invoice_number}*\n` +
      `Eventos Tany \uD83C\uDF88\n\n` +
      `Cliente: ${invoice.client_name}\n` +
      `Fecha: ${formatDate(invoice.event_date)}\n` +
      `Hora: ${invoice.event_time || 'Por confirmar'}\n` +
      `Lugar: ${invoice.event_address}\n\n` +
      `*Articulos:*\n${items}\n\n` +
      `*Total: ${formatCurrency(invoice.total)}*\n` +
      `Anticipo: ${formatCurrency(invoice.advance_payment || 0)}\n` +
      `*Restante: ${formatCurrency(invoice.remaining_payment || 0)}*\n\n` +
      `Condiciones de servicio aplican.\n` +
      `\u00A1Gracias por su preferencia! \uD83C\uDF89`
    );
  }

  // Open payment modal with remaining pre-filled if liquidar
  function openPaymentModal() {
    setPaymentAmount('');
    setPaymentType('anticipo');
    setShowPaymentModal(true);
  }

  if (loading) return <LoadingSpinner />;

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Factura no encontrada</p>
        <button onClick={() => navigate('/invoices')} className="btn-primary mt-4">
          Volver a Facturas
        </button>
      </div>
    );
  }

  const invoiceItems = invoice.items || [];
  const conditions =
    invoice.conditions
      ? invoice.conditions.split('\n').filter((c) => c.trim())
      : CONTRACT_CONDITIONS;

  // Current status index in the flow
  const currentStatusIndex = STATUS_FLOW.indexOf(invoice.status);
  const availableStatuses =
    currentStatusIndex >= 0
      ? STATUS_FLOW.slice(currentStatusIndex + 1)
      : INVOICE_STATUSES.filter((s) => s !== invoice.status);

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/invoices')}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors text-sm no-print"
      >
        <ArrowLeft size={16} />
        Facturas
      </button>

      {/* Action Bar */}
      <div className="card no-print">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusBadge status={invoice.status} className="text-sm px-3 py-1" />
          <span
            className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(
              invoice.payment_status
            )}`}
          >
            {getPaymentStatusIcon(invoice.payment_status)} {invoice.payment_status}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* WhatsApp */}
          <WhatsAppButton
            phone={invoice.client_phone}
            message={buildWhatsAppMessage()}
            size="md"
            label="WhatsApp"
          />

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="btn-secondary inline-flex items-center gap-1.5 text-sm"
          >
            <Download size={16} />
            Descargar PDF
          </button>

          {/* Register Payment */}
          {invoice.payment_status !== 'Pagado' && (
            <button
              onClick={openPaymentModal}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
            >
              <CreditCard size={16} />
              Registrar Pago
            </button>
          )}

          {/* Status Change Dropdown */}
          {invoice.status !== 'Completada' && invoice.status !== 'Cancelada' && (
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="btn-secondary inline-flex items-center gap-1.5 text-sm"
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
                  <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20 min-w-[180px]">
                    {availableStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            getStatusColor(status).split(' ')[0]
                          }`}
                        />
                        {status}
                      </button>
                    ))}
                    {invoice.status !== 'Cancelada' && (
                      <>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => handleStatusChange('Cancelada')}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Cancelar factura
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Edit */}
          <button
            onClick={() => navigate(`/invoices/${id}/edit`)}
            className="btn-secondary inline-flex items-center gap-1.5 text-sm"
          >
            <Edit size={16} />
            Editar
          </button>

          {/* Delete */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* INVOICE PREVIEW - PRINT-FRIENDLY CONTRACT    */}
      {/* ============================================ */}
      <div
        id="invoice-preview"
        className="max-w-2xl mx-auto bg-white border border-gray-300 overflow-hidden"
        style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
      >
        {/* Header — solid dark, transparent on print */}
        <div className="invoice-header-footer p-6" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
          <div className="flex justify-between items-start">
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
                <h1 className="text-2xl font-bold tracking-wide mb-1">EVENTOS TANY</h1>
              )}
              <p className="text-xs" style={{ opacity: 0.85 }}>
                Renta de brincolines, mesas, sillas y mobiliario
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold tracking-widest uppercase">
                Contrato de Renta
              </h2>
              <p className="text-xl font-bold mt-1">{invoice.invoice_number}</p>
              <p className="text-xs mt-1" style={{ opacity: 0.85 }}>
                {formatDate(invoice.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Client + Event — two-column layout */}
        <div className="grid grid-cols-2 border-b border-gray-300">
          {/* Client */}
          <div className="p-5 border-r border-gray-300">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Cliente
            </h3>
            <p className="text-base font-bold text-gray-900">{invoice.client_name}</p>
            {invoice.client_phone && (
              <p className="text-sm text-gray-600 mt-0.5">
                Tel: {formatPhoneDisplay(invoice.client_phone)}
              </p>
            )}
          </div>

          {/* Event */}
          <div className="p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Datos del Evento
            </h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-semibold text-gray-900">Fecha:</span>{' '}
                {formatDate(invoice.event_date)}
              </p>
              {invoice.event_time && (
                <p>
                  <span className="font-semibold text-gray-900">Hora:</span>{' '}
                  {invoice.event_time}
                </p>
              )}
              {invoice.event_type && (
                <p>
                  <span className="font-semibold text-gray-900">Tipo:</span>{' '}
                  {invoice.event_type}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Event address — full width */}
        {invoice.event_address && (
          <div className="px-5 py-3 border-b border-gray-300 text-sm">
            <span className="font-semibold text-gray-900">Direccion del evento:</span>{' '}
            <span className="text-gray-700">{invoice.event_address}</span>
          </div>
        )}

        {/* Items Table — clean bordered table */}
        <div className="p-5 border-b border-gray-300">
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
              {invoiceItems.map((item, i) => (
                <tr key={i}>
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
                    {formatCurrency(item.line_total || item.quantity * item.unit_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals — right-aligned summary */}
          <div className="flex justify-end mt-4">
            <div className="w-64 space-y-1.5">
              {Number(invoice.discount_percent) > 0 && (
                <>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Descuento ({invoice.discount_percent}%):</span>
                    <span>-{formatCurrency(invoice.discount_amount)}</span>
                  </div>
                </>
              )}
              <div
                className="flex justify-between text-lg font-bold border-t-2 border-gray-900 pt-2 mt-1"
              >
                <span className="text-gray-900">TOTAL:</span>
                <span className="text-gray-900">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary — clean box with borders */}
        <div className="p-5 border-b border-gray-300">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
            Resumen de Pago
          </h3>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2.5 border-b border-gray-200">
              <span className="text-sm text-gray-600">Total del contrato:</span>
              <span className="font-bold text-gray-900">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5 border-b border-gray-200">
              <span className="text-sm text-gray-600">Anticipo recibido:</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(invoice.advance_payment || 0)}
              </span>
            </div>
            <div
              className="flex justify-between items-center px-4 py-3"
              style={{ backgroundColor: '#f3f4f6' }}
            >
              <span className="text-base font-bold text-gray-900">SALDO PENDIENTE:</span>
              <span className="text-base font-bold text-gray-900">
                {formatCurrency(invoice.remaining_payment || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="p-5 border-b border-gray-300">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Notas
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        {/* Conditions */}
        <div className="p-5 border-b border-gray-300">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
            Condiciones del Servicio
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600 leading-relaxed">
            {conditions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ol>
        </div>

        {/* Signatures — two columns */}
        <div className="grid grid-cols-2 gap-8 p-5 border-b border-gray-300">
          <div className="text-center">
            <div className="border-b-2 border-gray-400 mb-2 pt-14" />
            <p className="text-xs text-gray-500 font-medium">Firma del Cliente</p>
            <p className="text-xs text-gray-400 mt-0.5">{invoice.client_name}</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-gray-400 mb-2 pt-14" />
            <p className="text-xs text-gray-500 font-medium">Eventos Tany</p>
            <p className="text-xs text-gray-400 mt-0.5">Representante</p>
          </div>
        </div>

        {/* Footer — solid dark, transparent on print */}
        <div className="invoice-header-footer px-5 py-3 text-center text-xs" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
          <p className="font-medium">
            Eventos Tany | Tel: (452) 123-5725 | Instagram: @eventostany
          </p>
        </div>
      </div>

      {/* ============================================ */}
      {/* MODALS                                       */}
      {/* ============================================ */}

      {/* Payment Registration Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowPaymentModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Registrar Pago
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Restante: {formatCurrency(invoice.remaining_payment || 0)}
            </p>

            {/* Payment Type */}
            <div className="space-y-3 mb-5">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentType"
                  value="anticipo"
                  checked={paymentType === 'anticipo'}
                  onChange={() => {
                    setPaymentType('anticipo');
                    setPaymentAmount('');
                  }}
                  className="accent-pink-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Anticipo adicional</p>
                  <p className="text-xs text-gray-400">Abono parcial al saldo</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentType"
                  value="liquidar"
                  checked={paymentType === 'liquidar'}
                  onChange={() => {
                    setPaymentType('liquidar');
                    setPaymentAmount(String(invoice.remaining_payment || 0));
                  }}
                  className="accent-pink-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Liquidar total</p>
                  <p className="text-xs text-gray-400">
                    Pagar todo el restante ({formatCurrency(invoice.remaining_payment || 0)})
                  </p>
                </div>
              </label>
            </div>

            {/* Amount input */}
            <div className="mb-6">
              <label className="label">Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="input-field pl-7"
                  placeholder="0.00"
                  disabled={paymentType === 'liquidar'}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={savingPayment}
                className="btn-primary"
              >
                {savingPayment ? 'Guardando...' : 'Registrar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar Factura"
        message={`Se eliminara permanentemente la factura ${invoice.invoice_number}. Esta accion no se puede deshacer.`}
        confirmText={deleting ? 'Eliminando...' : 'Eliminar'}
        variant="danger"
      />
    </div>
  );
}
