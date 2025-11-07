import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  User,
  Phone,
  Mail,
  Calendar,
  TrendingDown,
  X,
} from 'lucide-react';
import { User as UserType } from '../lib/supabase';
import { callMCPTool } from '../lib/ghl-mcp';

interface DealsAtRiskProps {
  user: UserType;
}

interface DealAtRisk {
  id: string;
  name: string;
  monetaryValue: number;
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
  lastStatusChangeAt: string;
  createdAt: string;
  daysSinceUpdate: number;
  riskLevel: 'high' | 'medium' | 'low';
}

export function DealsAtRisk({ user }: DealsAtRiskProps) {
  const [deals, setDeals] = useState<DealAtRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadDealsAtRisk();
  }, [user]);

  const loadDealsAtRisk = async () => {
    setLoading(true);

    try {
      const isAdmin = user.role === 'admin';
      const userId = user.ghl_user_id;

      // Obtener oportunidades
      const opportunitiesResponse = await callMCPTool(
        'opportunities_search-opportunity',
        {
          locationId: 'crN2IhAuOBAl7D8324yI',
          ...(isAdmin ? {} : { assignedTo: userId }),
        },
        user.role,
        userId
      );

      const opportunities =
        opportunitiesResponse.success && opportunitiesResponse.data?.opportunities
          ? opportunitiesResponse.data.opportunities
          : [];

      // Filtrar y calcular deals en riesgo
      const now = Date.now();
      const dealsAtRisk: DealAtRisk[] = opportunities
        .filter((opp: any) => {
          // Solo deals activos (no ganados ni perdidos)
          return opp.status !== 'won' && opp.status !== 'lost';
        })
        .map((opp: any) => {
          const lastUpdate = new Date(opp.lastStatusChangeAt || opp.createdAt).getTime();
          const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

          let riskLevel: 'high' | 'medium' | 'low' = 'low';
          if (daysSinceUpdate > 45) riskLevel = 'high';
          else if (daysSinceUpdate > 30) riskLevel = 'medium';

          return {
            id: opp.id,
            name: opp.name,
            monetaryValue: parseFloat(opp.monetaryValue || 0),
            contact: opp.contact,
            lastStatusChangeAt: opp.lastStatusChangeAt || opp.createdAt,
            createdAt: opp.createdAt,
            daysSinceUpdate,
            riskLevel,
          };
        })
        .filter((deal: DealAtRisk) => deal.daysSinceUpdate > 30)
        .sort((a: DealAtRisk, b: DealAtRisk) => b.daysSinceUpdate - a.daysSinceUpdate);

      setDeals(dealsAtRisk);
    } catch (error) {
      console.error('Error loading deals at risk:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };

  const getRiskColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          badge: 'bg-red-500/20',
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20',
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          badge: 'bg-blue-500/20',
        };
    }
  };

  const getRiskLabel = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return 'Riesgo Alto';
      case 'medium':
        return 'Riesgo Medio';
      default:
        return 'Monitorear';
    }
  };

  if (loading) {
    return (
      <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
          <h3 className="text-lg font-bold text-stone-50">Cargando alertas...</h3>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-lg rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-400">¡Excelente trabajo!</h3>
            <p className="text-stone-300 text-sm">
              No tienes deals en riesgo. Tu pipeline está actualizado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayedDeals = showAll ? deals : deals.slice(0, 3);
  const totalValue = deals.reduce((sum, deal) => sum + deal.monetaryValue, 0);

  return (
    <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-50">Deals en Riesgo</h3>
            <p className="text-sm text-stone-400">
              {deals.length} oportunidad{deals.length !== 1 ? 'es' : ''} • {formatCurrency(totalValue)} en juego
            </p>
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="space-y-3 mb-4">
        {displayedDeals.map((deal) => {
          const colors = getRiskColor(deal.riskLevel);
          return (
            <div
              key={deal.id}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4 transition-all hover:shadow-lg`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-stone-50">{deal.name}</h4>
                    <span className={`${colors.badge} ${colors.text} text-xs px-2 py-0.5 rounded-full font-semibold`}>
                      {getRiskLabel(deal.riskLevel)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span className="text-lg font-bold text-stone-50">
                      {formatCurrency(deal.monetaryValue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              {deal.contact && (
                <div className="space-y-1 mb-3">
                  {deal.contact.name && (
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-stone-400" />
                      <span className="text-xs text-stone-300">{deal.contact.name}</span>
                    </div>
                  )}
                  {deal.contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-stone-400" />
                      <span className="text-xs text-stone-300">{deal.contact.email}</span>
                    </div>
                  )}
                  {deal.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span className="text-xs text-stone-300">{deal.contact.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Time Info */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-600/30">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${colors.text}`} />
                  <span className={`text-sm ${colors.text} font-semibold`}>
                    {deal.daysSinceUpdate} días sin actualizar
                  </span>
                </div>
                <button
                  className={`${colors.text} hover:underline text-xs font-semibold`}
                >
                  Tomar acción →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {deals.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-sm text-emerald-400 hover:text-emerald-300 font-semibold py-2 border-t border-stone-700/50"
        >
          {showAll ? 'Mostrar menos' : `Ver todos (${deals.length})`}
        </button>
      )}

      {/* Action Suggestions */}
      <div className="mt-4 p-4 bg-stone-700/30 rounded-lg border border-stone-600/30">
        <h4 className="text-sm font-semibold text-stone-50 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500" />
          Acciones Recomendadas
        </h4>
        <ul className="space-y-1 text-xs text-stone-400">
          <li>• Programa llamadas de seguimiento esta semana</li>
          <li>• Revisa si hay cambios en las necesidades del cliente</li>
          <li>• Considera reasignar deals si el broker está sobrecargado</li>
          <li>• Actualiza notas y próximos pasos en cada oportunidad</li>
        </ul>
      </div>
    </div>
  );
}
