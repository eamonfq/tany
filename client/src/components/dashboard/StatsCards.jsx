import { Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const cards = [
  {
    key: 'eventsThisMonth',
    label: 'Eventos este mes',
    icon: Calendar,
    borderColor: 'border-l-brand-pink',
    iconBg: 'bg-pink-50',
    iconColor: 'text-brand-pink',
    format: (v) => v,
  },
  {
    key: 'incomeThisMonth',
    label: 'Ingresos del mes',
    icon: DollarSign,
    borderColor: 'border-l-green-500',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    format: (v) => formatCurrency(v),
  },
  {
    key: 'newClientsThisMonth',
    label: 'Clientes nuevos',
    icon: Users,
    borderColor: 'border-l-blue-500',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    format: (v) => v,
  },
  {
    key: 'pendingPayments',
    label: 'Pagos pendientes',
    icon: Clock,
    borderColor: 'border-l-orange-500',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    format: (v) => formatCurrency(v),
  },
];

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className={`card border-l-4 ${card.borderColor}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <Icon size={20} className={card.iconColor} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 truncate">{card.label}</p>
                <p className="text-xl font-bold text-gray-900">
                  {card.format(stats[card.key])}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
