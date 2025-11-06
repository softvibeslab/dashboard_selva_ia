import { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, Target, RefreshCw } from 'lucide-react';
import { User } from '../lib/supabase';
import { fetchRealMetrics, Metrics } from '../lib/metrics-service';

interface MetricsWidgetProps {
  user: User;
}

export function MetricsWidget({ user }: MetricsWidgetProps) {
  const [metrics, setMetrics] = useState<Metrics>({
    leads: 0,
    opportunities: 0,
    revenue: 0,
    conversion: 0,
    loading: true,
  });

  const loadMetrics = async () => {
    setMetrics(prev => ({ ...prev, loading: true }));
    const realMetrics = await fetchRealMetrics(user);
    setMetrics(realMetrics);
  };

  useEffect(() => {
    loadMetrics();

    // Auto-refresh cada 5 minutos
    const interval = setInterval(loadMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Formatear revenue según el tamaño
  const formatRevenue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };

  const cards = [
    { icon: Users, label: 'Leads', value: metrics.loading ? '...' : metrics.leads, color: 'from-emerald-600 to-green-700' },
    { icon: Target, label: 'Oportunidades', value: metrics.loading ? '...' : metrics.opportunities, color: 'from-green-600 to-emerald-700' },
    { icon: DollarSign, label: 'Revenue', value: metrics.loading ? '...' : formatRevenue(metrics.revenue), color: 'from-orange-600 to-red-600' },
    { icon: TrendingUp, label: 'Conversión', value: metrics.loading ? '...' : `${metrics.conversion}%`, color: 'from-amber-600 to-orange-600' },
  ];

  return (
    <div className="flex gap-3 items-center">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-stone-800/60 backdrop-blur-lg border border-stone-700/50 rounded-xl p-3 min-w-[100px] transition-all hover:border-stone-600/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-8 h-8 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-stone-50">{card.value}</p>
            <p className="text-xs text-stone-400">{card.label}</p>
          </div>
        );
      })}

      {/* Botón de refresh manual */}
      <button
        onClick={loadMetrics}
        disabled={metrics.loading}
        className="bg-stone-800/60 backdrop-blur-lg border border-stone-700/50 rounded-xl p-3 hover:border-stone-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        title="Actualizar métricas"
      >
        <RefreshCw className={`w-5 h-5 text-stone-400 group-hover:text-emerald-500 transition-colors ${metrics.loading ? 'animate-spin' : ''}`} />
      </button>

      {/* Indicador de error */}
      {metrics.error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          Error: {metrics.error}
        </div>
      )}
    </div>
  );
}
