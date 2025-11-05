import { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, Target, Loader2 } from 'lucide-react';
import { User } from '../lib/supabase';
import { fetchMetrics, Metrics } from '../lib/metrics-service';

interface MetricsWidgetProps {
  user: User;
}

export function MetricsWidget({ user }: MetricsWidgetProps) {
  const [metrics, setMetrics] = useState<Metrics>({
    leads: 0,
    opportunities: 0,
    revenue: 0,
    conversion: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      const data = await fetchMetrics(user);
      setMetrics(data);
      setLoading(false);
    }
    loadMetrics();
  }, [user]);

  const cards = [
    { icon: Users, label: 'Leads', value: metrics.leads, color: 'from-emerald-600 to-green-700' },
    { icon: Target, label: 'Oportunidades', value: metrics.opportunities, color: 'from-green-600 to-emerald-700' },
    { icon: DollarSign, label: 'Revenue', value: `$${(metrics.revenue / 1000000).toFixed(1)}M`, color: 'from-orange-600 to-red-600' },
    { icon: TrendingUp, label: 'Conversión', value: `${metrics.conversion}%`, color: 'from-amber-600 to-orange-600' },
  ];

  if (loading) {
    return (
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-stone-800/60 backdrop-blur-lg border border-stone-700/50 rounded-xl p-3 min-w-[100px] flex items-center justify-center"
          >
            <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-stone-800/60 backdrop-blur-lg border border-stone-700/50 rounded-xl p-3 min-w-[100px]"
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
    </div>
  );
}
