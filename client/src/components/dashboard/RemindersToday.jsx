import { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle } from 'lucide-react';
import { remindersApi } from '../../utils/api';
import { getReminderTypeLabel, getReminderTypeIcon, isPast } from '../../utils/formatters';
import WhatsAppButton from '../shared/WhatsAppButton';

export default function RemindersToday({ reminders, onUpdate }) {
  const [updatingId, setUpdatingId] = useState(null);

  async function handleMarkSent(reminder) {
    setUpdatingId(reminder.id);
    try {
      await remindersApi.updateStatus(reminder.id, 'Enviado');
      onUpdate();
    } catch (error) {
      console.error('Error updating reminder:', error);
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingReminders = reminders.filter((r) => r.status !== 'Enviado' && r.status !== 'Descartado');

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          Recordatorios de Hoy 🔔
          {pendingReminders.length > 0 && (
            <span className="bg-brand-pink text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingReminders.length}
            </span>
          )}
        </h2>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Bell size={40} className="mx-auto mb-2 opacity-50" />
          <p>No hay recordatorios para hoy</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const isOverdue = isPast(reminder.reminder_date);
            const isSent = reminder.status === 'Enviado';

            return (
              <div
                key={reminder.id}
                className={`p-3 rounded-lg border transition-colors ${
                  isSent
                    ? 'border-green-200 bg-green-50/50 opacity-60'
                    : isOverdue
                    ? 'border-red-200 bg-red-50/30'
                    : 'border-gray-100 hover:border-brand-pink/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg flex-shrink-0">
                      {getReminderTypeIcon(reminder.type)}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-gray-500 block">
                        {getReminderTypeLabel(reminder.type)}
                      </span>
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {reminder.client_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isOverdue && !isSent && (
                      <span className="badge bg-red-100 text-red-700 flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Atrasado
                      </span>
                    )}
                    {isSent && (
                      <span className="badge bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle size={10} />
                        Enviado
                      </span>
                    )}
                    {reminder.priority === 'high' && !isSent && (
                      <span className="badge bg-orange-100 text-orange-700">
                        Urgente
                      </span>
                    )}
                  </div>
                </div>

                {reminder.message_template && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {reminder.message_template.length > 100
                      ? reminder.message_template.substring(0, 100) + '...'
                      : reminder.message_template}
                  </p>
                )}

                {!isSent && (
                  <div className="flex items-center gap-2">
                    <WhatsAppButton
                      phone={reminder.client_phone}
                      message={reminder.message_template || ''}
                      size="sm"
                      label="WhatsApp"
                    />
                    <button
                      onClick={() => handleMarkSent(reminder)}
                      disabled={updatingId === reminder.id}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={12} />
                      {updatingId === reminder.id ? 'Guardando...' : 'Enviado'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
