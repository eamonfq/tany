import { getStatusColor } from '../../utils/formatters';

export default function StatusBadge({ status, className = '' }) {
  return (
    <span className={`badge ${getStatusColor(status)} ${className}`}>
      {status}
    </span>
  );
}
