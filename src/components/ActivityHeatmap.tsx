import { useEffect, useState } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';
import { User } from '../lib/supabase';
import { getActivityHeatmap } from '../lib/contact-service';

interface ActivityHeatmapProps {
  contactId: string;
  user: User;
}

export function ActivityHeatmap({ contactId, user }: ActivityHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHeatmap();
  }, [contactId]);

  const loadHeatmap = async () => {
    setLoading(true);
    const data = await getActivityHeatmap(contactId, user);
    setHeatmapData(data);
    setLoading(false);
  };

  const getIntensityColor = (count: number, maxCount: number) => {
    if (count === 0) return 'bg-stone-700/30';

    const intensity = maxCount > 0 ? count / maxCount : 0;

    if (intensity > 0.75) return 'bg-emerald-600';
    if (intensity > 0.5) return 'bg-emerald-500';
    if (intensity > 0.25) return 'bg-emerald-400';
    return 'bg-emerald-300';
  };

  const maxCount = Math.max(...heatmapData.map((d) => d.count), 1);
  const totalActivities = heatmapData.reduce((sum, d) => sum + d.count, 0);

  if (loading) {
    return (
      <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-50">Mapa de Calor de Actividad</h3>
            <p className="text-sm text-stone-400">Últimos 30 días • {totalActivities} actividades</p>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-4">
        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <span>Menos</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-stone-700/30 rounded" />
            <div className="w-4 h-4 bg-emerald-300 rounded" />
            <div className="w-4 h-4 bg-emerald-400 rounded" />
            <div className="w-4 h-4 bg-emerald-500 rounded" />
            <div className="w-4 h-4 bg-emerald-600 rounded" />
          </div>
          <span>Más</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-10 gap-2">
          {heatmapData.map((day, index) => {
            const date = new Date(day.date);
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            return (
              <div
                key={index}
                className="group relative"
                title={`${day.date}: ${day.count} actividades`}
              >
                <div
                  className={`w-full aspect-square rounded ${getIntensityColor(
                    day.count,
                    maxCount
                  )} transition-all hover:scale-110 hover:shadow-lg cursor-pointer ${
                    isWeekend ? 'opacity-60' : ''
                  }`}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                    <p className="text-stone-50 font-semibold">
                      {date.toLocaleDateString('es-MX', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-stone-400">
                      {day.count} {day.count === 1 ? 'actividad' : 'actividades'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-700/30">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{totalActivities}</p>
            <p className="text-xs text-stone-400">Total Actividades</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {(totalActivities / 30).toFixed(1)}
            </p>
            <p className="text-xs text-stone-400">Promedio Diario</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{maxCount}</p>
            <p className="text-xs text-stone-400">Día Más Activo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
