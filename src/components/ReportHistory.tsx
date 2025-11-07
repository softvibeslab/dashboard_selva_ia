import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { User } from '../lib/supabase';
import { getReportHistory, type ReportHistory as ReportHistoryType } from '../lib/reports-service';

interface ReportHistoryProps {
  user: User;
}

export function ReportHistory({ user }: ReportHistoryProps) {
  const [history, setHistory] = useState<ReportHistoryType[]>([]);
  const [filter, setFilter] = useState<'all' | 'sent' | 'failed' | 'pending'>('all');

  useEffect(() => {
    loadHistory();
  }, [user.id]);

  const loadHistory = () => {
    const reportHistory = getReportHistory(user.id);
    setHistory(reportHistory);
  };

  const filteredHistory = history.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getStatusIcon = (status: ReportHistoryType['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusLabel = (status: ReportHistoryType['status']) => {
    switch (status) {
      case 'sent':
        return 'Enviado';
      case 'failed':
        return 'Fallido';
      case 'pending':
        return 'Pendiente';
    }
  };

  const getStatusColor = (status: ReportHistoryType['status']) => {
    switch (status) {
      case 'sent':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      case 'pending':
        return 'bg-amber-500/20 text-amber-400';
    }
  };

  const stats = {
    total: history.length,
    sent: history.filter(h => h.status === 'sent').length,
    failed: history.filter(h => h.status === 'failed').length,
    pending: history.filter(h => h.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-stone-800/30 rounded-xl border border-stone-700/30">
          <div className="text-2xl font-bold text-stone-50">{stats.total}</div>
          <div className="text-sm text-stone-400">Total</div>
        </div>
        <div className="p-4 bg-emerald-600/10 rounded-xl border border-emerald-500/20">
          <div className="text-2xl font-bold text-emerald-400">{stats.sent}</div>
          <div className="text-sm text-stone-400">Enviados</div>
        </div>
        <div className="p-4 bg-red-600/10 rounded-xl border border-red-500/20">
          <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
          <div className="text-sm text-stone-400">Fallidos</div>
        </div>
        <div className="p-4 bg-amber-600/10 rounded-xl border border-amber-500/20">
          <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
          <div className="text-sm text-stone-400">Pendientes</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'sent', 'failed', 'pending'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === filterOption
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'bg-stone-800/30 text-stone-400 border border-stone-700/30 hover:border-stone-600/50'
            }`}
          >
            {filterOption === 'all' && 'Todos'}
            {filterOption === 'sent' && 'Enviados'}
            {filterOption === 'failed' && 'Fallidos'}
            {filterOption === 'pending' && 'Pendientes'}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-stone-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay reportes en el historial</p>
            {filter !== 'all' && (
              <p className="text-sm">
                Prueba cambiar el filtro para ver otros reportes
              </p>
            )}
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-stone-800/40 rounded-xl border border-stone-700/50 hover:border-stone-600/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(item.status)}

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-stone-50">
                        {item.templateName}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.type === 'manual'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {item.type === 'manual' ? 'Manual' : 'Programado'}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-stone-400">
                      <div>
                        <span className="text-stone-500">Generado:</span>{' '}
                        {item.generatedAt.toLocaleString('es-MX')}
                      </div>
                      <div>
                        <span className="text-stone-500">Enviado a:</span>{' '}
                        {item.sentTo.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {item.downloadUrl && (
                  <button
                    className="p-2 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-lg transition-all"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination info */}
      {filteredHistory.length > 0 && (
        <div className="text-center text-sm text-stone-500">
          Mostrando {filteredHistory.length} de {history.length} reportes
        </div>
      )}
    </div>
  );
}
