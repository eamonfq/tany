import { X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    primary: 'bg-brand-pink hover:bg-brand-pink-dark text-white',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-6">{message}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
