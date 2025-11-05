import { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { User } from '../lib/supabase';

interface MetricsWidgetProps {
  user: User;
}

export function MetricsWidget({ user }: MetricsWidgetProps) {
  const [metrics, setMetrics] = useState({
    leads: 0,
    opportunities: 0,
    revenue: 0,
    conversion: 0,
  });

  useEffect(() => {
    setMetrics({
      leads: user.role === 'admin' ? 156 : 47,
      opportunities: user.role === 'admin' ? 89 : 28,
      revenue: user.role === 'admin' ? 12500000 : 600000,
      conversion: user.role === 'admin' ? 32 : 28,
    });
  }, [user]);

  const cards = [
    { icon: Users, label: 'Leads', value: metrics.leads, color: 'from-blue-500 to-cyan-500' },
    { icon: Target, label: 'Oportunidades', value: metrics.opportunities, color: 'from-emerald-500 to-teal-500' },
    { icon: DollarSign, label: 'Revenue', value: `$${(metrics.revenue / 1000000).toFixed(1)}M`, color: 'from-amber-500 to-orange-500' },
    { icon: TrendingUp, label: 'Conversión', value: `${metrics.conversion}%`, color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div className="flex gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-3 min-w-[100px]"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-8 h-8 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-blue-200">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
