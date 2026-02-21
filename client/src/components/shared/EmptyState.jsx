export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="mb-4 text-gray-300">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      )}

      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
