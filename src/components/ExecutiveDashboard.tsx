import { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Target,
  Users,
  Calendar,
  Zap,
  Award,
  Activity
} from 'lucide-react';
import { User } from '../lib/supabase';
import { fetchDetailedMetrics } from '../lib/metrics-service';

interface ExecutiveDashboardProps {
  user: User;
}

interface DetailedMetrics {
  pipelineAnalysis: Record<string, { count: number; value: number }>;
  dealsAtRisk: number;
  avgDealSize: number;
  totalPipelineValue: number;
}

export function ExecutiveDashboard({ user }: ExecutiveDashboardProps) {
  const [metrics, setMetrics] = useState<DetailedMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    // Auto-refresh cada 10 minutos
    const interval = setInterval(loadMetrics, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const loadMetrics = async () => {
    setLoading(true);
    const data = await fetchDetailedMetrics(user);
    setMetrics(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Activity className="w-12 h-12 text-emerald-500 animate-pulse mx-auto mb-4" />
          <p className="text-stone-300">Cargando dashboard ejecutivo...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-stone-300">Error al cargar métricas</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };

  // KPIs principales
  const mainKPIs = [
    {
      icon: DollarSign,
      label: 'Pipeline Total',
      value: formatCurrency(metrics.totalPipelineValue),
      color: 'from-emerald-600 to-green-700',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      icon: Target,
      label: 'Deal Promedio',
      value: formatCurrency(metrics.avgDealSize),
      color: 'from-blue-600 to-cyan-700',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      icon: AlertTriangle,
      label: 'En Riesgo',
      value: metrics.dealsAtRisk,
      color: 'from-red-600 to-orange-700',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      alert: metrics.dealsAtRisk > 0,
    },
    {
      icon: Award,
      label: 'Total Deals',
      value: Object.values(metrics.pipelineAnalysis).reduce((sum, stage) => sum + stage.count, 0),
      color: 'from-purple-600 to-pink-700',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  // Análisis por etapa del pipeline
  const pipelineStages = Object.entries(metrics.pipelineAnalysis).map(([stage, data]) => ({
    name: formatStageName(stage),
    count: data.count,
    value: data.value,
    percentage: (data.value / metrics.totalPipelineValue) * 100,
  }));

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-stone-900">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-stone-50 mb-2">
          Dashboard Ejecutivo
        </h2>
        <p className="text-stone-400">
          {user.role === 'admin' ? 'Vista general del equipo' : 'Tu rendimiento personal'}
        </p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainKPIs.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`${kpi.bgColor} ${kpi.borderColor} border backdrop-blur-lg rounded-xl p-6 transition-all hover:scale-105`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${kpi.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {kpi.alert && (
                  <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-full">
                    <Zap className="w-3 h-3" />
                    Alerta
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-stone-50 mb-1">{kpi.value}</p>
              <p className="text-sm text-stone-400">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline Analysis */}
      <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-stone-50 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Análisis de Pipeline
          </h3>
        </div>

        <div className="space-y-4">
          {pipelineStages.map((stage) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-300 font-medium">{stage.name}</span>
                <span className="text-stone-400">
                  {stage.count} deals • {formatCurrency(stage.value)}
                </span>
              </div>
              <div className="relative h-3 bg-stone-700/50 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-emerald-600 to-green-700 rounded-full transition-all duration-500"
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>{stage.percentage.toFixed(1)}% del pipeline</span>
                <span>{formatCurrency(stage.value / stage.count)} promedio</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas y Recomendaciones */}
      {metrics.dealsAtRisk > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-400 mb-2">
                ⚠️ Atención Requerida
              </h3>
              <p className="text-stone-300 mb-3">
                Tienes <strong>{metrics.dealsAtRisk}</strong> oportunidad{metrics.dealsAtRisk !== 1 ? 'es' : ''} sin actualizar en más de 30 días.
              </p>
              <ul className="space-y-2 text-sm text-stone-400">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-400" />
                  Deals estancados pueden perder momentum
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-400" />
                  Considera reasignar o hacer follow-up urgente
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-400" />
                  Agenda llamadas de reactivación esta semana
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="text-xl font-bold text-stone-50">Insights Inteligentes</h3>
        </div>
        <div className="space-y-3">
          {generateInsights(metrics).map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-stone-700/30 rounded-lg border border-stone-600/30"
            >
              <span className="text-2xl">{insight.icon}</span>
              <div>
                <p className="text-stone-300 text-sm">{insight.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper: Formatear nombres de etapas
function formatStageName(stage: string): string {
  const stageNames: Record<string, string> = {
    'new': 'Nuevo',
    'qualified': 'Calificado',
    'proposal': 'Propuesta',
    'negotiation': 'Negociación',
    'closed': 'Cerrado',
    'won': 'Ganado',
    'lost': 'Perdido',
    'unknown': 'Sin etapa',
  };

  return stageNames[stage.toLowerCase()] || stage;
}

// Helper: Generar insights automáticos
function generateInsights(metrics: DetailedMetrics) {
  const insights = [];

  // Insight sobre deals en riesgo
  if (metrics.dealsAtRisk > 5) {
    insights.push({
      icon: '🚨',
      text: `Alto nivel de deals en riesgo (${metrics.dealsAtRisk}). Considera hacer una sesión de revisión de pipeline esta semana.`,
    });
  } else if (metrics.dealsAtRisk > 0) {
    insights.push({
      icon: '⚠️',
      text: `${metrics.dealsAtRisk} deal${metrics.dealsAtRisk > 1 ? 's' : ''} necesita${metrics.dealsAtRisk > 1 ? 'n' : ''} atención. Programa follow-ups inmediatos.`,
    });
  }

  // Insight sobre tamaño promedio de deal
  if (metrics.avgDealSize > 50000) {
    insights.push({
      icon: '💎',
      text: `Excelente tamaño promedio de deal ($${(metrics.avgDealSize / 1000).toFixed(0)}K). Enfócate en calidad sobre cantidad.`,
    });
  } else if (metrics.avgDealSize < 10000) {
    insights.push({
      icon: '📈',
      text: 'Considera prospectar cuentas más grandes para aumentar el ticket promedio.',
    });
  }

  // Insight sobre pipeline total
  if (metrics.totalPipelineValue > 1000000) {
    insights.push({
      icon: '🎯',
      text: `Pipeline saludable de $${(metrics.totalPipelineValue / 1000000).toFixed(1)}M. Mantén el momentum con follow-ups consistentes.`,
    });
  }

  // Insight sobre distribución de etapas
  const stages = Object.values(metrics.pipelineAnalysis);
  if (stages.length > 0) {
    const totalDeals = stages.reduce((sum, stage) => sum + stage.count, 0);
    const negotiationDeals = stages.find(s => s.count > 0)?.count || 0;

    if (negotiationDeals / totalDeals > 0.3) {
      insights.push({
        icon: '🔥',
        text: 'Alto porcentaje en negociación. Enfócate en cerrar estas oportunidades en los próximos 7 días.',
      });
    }
  }

  // Si no hay insights, agregar uno genérico
  if (insights.length === 0) {
    insights.push({
      icon: '✅',
      text: 'Tu pipeline está en buen estado. Continúa con tus actividades de prospección y follow-up.',
    });
  }

  return insights;
}
