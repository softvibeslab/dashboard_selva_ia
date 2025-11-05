import { useEffect, useState } from 'react';
import { supabase, User } from '../lib/supabase';
import { BarChart3, TrendingUp, MessageSquare, Calendar } from 'lucide-react';

interface GraphicsViewProps {
  user: User;
}

interface Stats {
  totalQueries: number;
  queriesByType: { [key: string]: number };
  queriesByDay: { date: string; count: number }[];
  averageResponseTime: number;
}

export function GraphicsView({ user }: GraphicsViewProps) {
  const [stats, setStats] = useState<Stats>({
    totalQueries: 0,
    queriesByType: {},
    queriesByDay: [],
    averageResponseTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user.id]);

  const loadStats = async () => {
    try {
      const { data: messages, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (!messages || messages.length === 0) {
        setLoading(false);
        return;
      }

      const queriesByType: { [key: string]: number } = {};
      messages.forEach(msg => {
        queriesByType[msg.query_type] = (queriesByType[msg.query_type] || 0) + 1;
      });

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const queriesByDay = last7Days.map(date => {
        const count = messages.filter(msg =>
          msg.created_at.startsWith(date)
        ).length;
        return { date, count };
      });

      setStats({
        totalQueries: messages.length,
        queriesByType,
        queriesByDay,
        averageResponseTime: 1.2
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...stats.queriesByDay.map(d => d.count), 1);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-900/50 to-blue-900/50 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Estadísticas y Gráficos
        </h2>
        <p className="text-blue-200 text-sm">
          Análisis de tu actividad en el sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-200 text-sm">Total Consultas</p>
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalQueries}</p>
          <p className="text-xs text-blue-300 mt-1">Todas las consultas realizadas</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-200 text-sm">Tiempo Promedio</p>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.averageResponseTime}s</p>
          <p className="text-xs text-blue-300 mt-1">Respuesta del sistema</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-200 text-sm">Tipos de Consulta</p>
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">{Object.keys(stats.queriesByType).length}</p>
          <p className="text-xs text-blue-300 mt-1">Categorías diferentes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Consultas por Tipo
          </h3>

          {Object.keys(stats.queriesByType).length === 0 ? (
            <p className="text-blue-200 text-center py-8">No hay datos disponibles</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.queriesByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-blue-200">{type}</span>
                      <span className="text-sm font-semibold text-white">{count}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                        style={{ width: `${(count / stats.totalQueries) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Actividad - Últimos 7 Días
          </h3>

          {stats.queriesByDay.every(d => d.count === 0) ? (
            <p className="text-blue-200 text-center py-8">No hay datos disponibles</p>
          ) : (
            <div className="space-y-2">
              {stats.queriesByDay.map((day) => (
                <div key={day.date} className="flex items-end gap-2">
                  <div className="text-xs text-blue-300 w-16">
                    {new Date(day.date).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </div>
                  <div className="flex-1 h-8 bg-white/10 rounded overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded transition-all flex items-center justify-end pr-2"
                      style={{ width: `${(day.count / maxCount) * 100}%` }}
                    >
                      {day.count > 0 && (
                        <span className="text-xs font-semibold text-white">{day.count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
