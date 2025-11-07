import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Play, Pause, Calendar } from 'lucide-react';
import { User } from '../lib/supabase';
import {
  DEFAULT_TEMPLATES,
  getScheduledReports,
  addScheduledReport,
  updateScheduledReport,
  deleteScheduledReport,
  type ScheduledReport,
} from '../lib/reports-service';

interface ReportSchedulerProps {
  user: User;
}

export function ReportScheduler({ user }: ReportSchedulerProps) {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATES[0].id);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [time, setTime] = useState('09:00');
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [recipients, setRecipients] = useState(user.email || '');

  useEffect(() => {
    loadScheduledReports();
  }, [user.id]);

  const loadScheduledReports = () => {
    const reports = getScheduledReports(user.id);
    setScheduledReports(reports);
  };

  const handleAddReport = () => {
    const template = DEFAULT_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (!template) return;

    const recipientList = recipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (recipientList.length === 0) {
      alert('Por favor ingresa al menos un email');
      return;
    }

    addScheduledReport(user.id, {
      templateId: selectedTemplateId,
      templateName: template.name,
      frequency,
      time,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      recipients: recipientList,
      active: true,
    });

    loadScheduledReports();
    setShowAddForm(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedTemplateId(DEFAULT_TEMPLATES[0].id);
    setFrequency('daily');
    setTime('09:00');
    setDayOfWeek(1);
    setDayOfMonth(1);
    setRecipients(user.email || '');
  };

  const handleToggleActive = (reportId: string, currentActive: boolean) => {
    updateScheduledReport(user.id, reportId, { active: !currentActive });
    loadScheduledReports();
  };

  const handleDelete = (reportId: string) => {
    if (confirm('¿Estás seguro de eliminar este reporte programado?')) {
      deleteScheduledReport(user.id, reportId);
      loadScheduledReports();
    }
  };

  const getDayName = (day: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[day];
  };

  const getFrequencyLabel = (report: ScheduledReport) => {
    switch (report.frequency) {
      case 'daily':
        return `Diario a las ${report.time}`;
      case 'weekly':
        return `Semanal - ${getDayName(report.dayOfWeek || 1)} a las ${report.time}`;
      case 'monthly':
        return `Mensual - Día ${report.dayOfMonth} a las ${report.time}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-stone-50">Reportes Programados</h3>
          <p className="text-sm text-stone-400">
            {scheduledReports.length} reporte{scheduledReports.length !== 1 ? 's' : ''} programado{scheduledReports.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Programar Reporte
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-6 bg-stone-800/30 rounded-xl border border-stone-700/30 space-y-4">
          <h4 className="font-semibold text-stone-50">Nuevo Reporte Programado</h4>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-purple-500"
            >
              {DEFAULT_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.icon} {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Frecuencia
            </label>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    frequency === freq
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                      : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-600'
                  }`}
                >
                  {freq === 'daily' && 'Diario'}
                  {freq === 'weekly' && 'Semanal'}
                  {freq === 'monthly' && 'Mensual'}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Hora
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Day of Week (for weekly) */}
          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Día de la Semana
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-purple-500"
              >
                {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                  <option key={day} value={day}>
                    {getDayName(day)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Day of Month (for monthly) */}
          {frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Día del Mes
              </label>
              <select
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-purple-500"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Día {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Destinatarios (separados por comas)
            </label>
            <input
              type="text"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddReport}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
            >
              Crear
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Scheduled Reports List */}
      <div className="space-y-3">
        {scheduledReports.length === 0 ? (
          <div className="p-8 text-center text-stone-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay reportes programados</p>
            <p className="text-sm">Crea uno para recibir reportes automáticamente</p>
          </div>
        ) : (
          scheduledReports.map((report) => (
            <div
              key={report.id}
              className={`p-4 rounded-xl border transition-all ${
                report.active
                  ? 'bg-stone-800/40 border-stone-700/50'
                  : 'bg-stone-800/20 border-stone-700/30 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-stone-50">{report.templateName}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        report.active
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-stone-600/20 text-stone-500'
                      }`}
                    >
                      {report.active ? 'Activo' : 'Pausado'}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-stone-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {getFrequencyLabel(report)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📧</span>
                      <span>{report.recipients.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">
                        Próximo envío: {report.nextScheduled.toLocaleString('es-MX')}
                      </span>
                    </div>
                    {report.lastSent && (
                      <div>
                        <span className="text-stone-500">
                          Último envío: {report.lastSent.toLocaleString('es-MX')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(report.id, report.active)}
                    className={`p-2 rounded-lg transition-all ${
                      report.active
                        ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30'
                        : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                    }`}
                    title={report.active ? 'Pausar' : 'Activar'}
                  >
                    {report.active ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
