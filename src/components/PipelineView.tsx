import { useEffect, useState } from 'react';
import {
  DollarSign,
  Calendar,
  User,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { User as UserType } from '../lib/supabase';
import { getOpportunities } from '../lib/ghl-api';

interface PipelineViewProps {
  user: UserType;
}

interface Opportunity {
  id: string;
  name: string;
  monetaryValue: number;
  status: string;
  pipelineStage?: string;
  contact?: {
    name: string;
    email: string;
  };
  assignedTo?: string;
  lastStatusChangeAt?: string;
  createdAt: string;
  expectedCloseDate?: string;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  icon: any;
  opportunities: Opportunity[];
  totalValue: number;
}

export function PipelineView({ user }: PipelineViewProps) {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Opportunity | null>(null);

  useEffect(() => {
    loadPipeline();
  }, [user]);

  const loadPipeline = async () => {
    setLoading(true);

    try {
      const isAdmin = user.role === 'admin';
      const userId = user.ghl_user_id || undefined;

      // Obtener oportunidades usando REST API
      const opportunitiesResponse = await getOpportunities(
        isAdmin || !userId ? {} : { assignedTo: userId }
      );

      const opportunities: Opportunity[] =
        opportunitiesResponse.success && opportunitiesResponse.data?.opportunities
          ? opportunitiesResponse.data.opportunities
          : [];

      // Organizar por etapas
      const stageMap: Record<string, PipelineStage> = {
        new: {
          id: 'new',
          name: 'Nuevo',
          color: 'from-blue-600 to-cyan-700',
          icon: TrendingUp,
          opportunities: [],
          totalValue: 0,
        },
        qualified: {
          id: 'qualified',
          name: 'Calificado',
          color: 'from-purple-600 to-pink-700',
          icon: CheckCircle,
          opportunities: [],
          totalValue: 0,
        },
        proposal: {
          id: 'proposal',
          name: 'Propuesta',
          color: 'from-amber-600 to-orange-700',
          icon: Calendar,
          opportunities: [],
          totalValue: 0,
        },
        negotiation: {
          id: 'negotiation',
          name: 'Negociación',
          color: 'from-green-600 to-emerald-700',
          icon: DollarSign,
          opportunities: [],
          totalValue: 0,
        },
        won: {
          id: 'won',
          name: 'Ganado',
          color: 'from-emerald-600 to-green-700',
          icon: CheckCircle,
          opportunities: [],
          totalValue: 0,
        },
        lost: {
          id: 'lost',
          name: 'Perdido',
          color: 'from-red-600 to-rose-700',
          icon: XCircle,
          opportunities: [],
          totalValue: 0,
        },
      };

      // Distribuir oportunidades por etapa
      opportunities.forEach((opp) => {
        const stageKey = (opp.pipelineStage || opp.status || 'new').toLowerCase();
        const stage = stageMap[stageKey] || stageMap['new'];

        stage.opportunities.push(opp);
        stage.totalValue += parseFloat(opp.monetaryValue?.toString() || '0');
      });

      setStages(Object.values(stageMap).filter((stage) => stage.opportunities.length > 0));
    } catch (error) {
      console.error('Error loading pipeline:', error);
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

  const getTimeAgo = (date: string) => {
    const now = new Date().getTime();
    const then = new Date(date).getTime();
    const diffInDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    return `Hace ${Math.floor(diffInDays / 30)} meses`;
  };

  const isStale = (date: string) => {
    const now = new Date().getTime();
    const then = new Date(date).getTime();
    const diffInDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
    return diffInDays > 30;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-300">Cargando pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 bg-stone-900">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-stone-50 mb-2">Pipeline Visual</h2>
            <p className="text-stone-400">
              {stages.reduce((sum, stage) => sum + stage.opportunities.length, 0)} oportunidades activas
            </p>
          </div>
          <button
            onClick={loadPipeline}
            className="bg-stone-800/60 backdrop-blur-lg border border-stone-700/50 rounded-xl px-4 py-2 hover:border-stone-600/50 transition-all flex items-center gap-2 text-stone-300 hover:text-emerald-500"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80 bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl overflow-hidden flex flex-col"
              >
                {/* Stage Header */}
                <div className={`bg-gradient-to-r ${stage.color} p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-white" />
                      <h3 className="text-lg font-bold text-white">{stage.name}</h3>
                    </div>
                    <span className="text-sm text-white/80 font-semibold">
                      {stage.opportunities.length}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 font-semibold">
                    {formatCurrency(stage.totalValue)}
                  </p>
                </div>

                {/* Opportunities List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {stage.opportunities.map((opp) => {
                    const stale = isStale(opp.lastStatusChangeAt || opp.createdAt);
                    return (
                      <div
                        key={opp.id}
                        onClick={() => setSelectedDeal(opp)}
                        className={`bg-stone-700/30 border ${
                          stale ? 'border-red-500/30' : 'border-stone-600/30'
                        } rounded-lg p-3 cursor-pointer hover:bg-stone-700/50 transition-all group`}
                      >
                        {/* Deal Header */}
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-semibold text-stone-50 line-clamp-2 flex-1 group-hover:text-emerald-400 transition-colors">
                            {opp.name || 'Sin título'}
                          </h4>
                          {stale && (
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 ml-2" />
                          )}
                        </div>

                        {/* Deal Value */}
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span className="text-lg font-bold text-stone-50">
                            {formatCurrency(parseFloat(opp.monetaryValue?.toString() || '0'))}
                          </span>
                        </div>

                        {/* Contact Info */}
                        {opp.contact && (
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-3 h-3 text-stone-400" />
                            <span className="text-xs text-stone-400 truncate">
                              {opp.contact.name || opp.contact.email}
                            </span>
                          </div>
                        )}

                        {/* Last Update */}
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-stone-500" />
                          <span className={`text-xs ${stale ? 'text-red-400' : 'text-stone-500'}`}>
                            {getTimeAgo(opp.lastStatusChangeAt || opp.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {stage.opportunities.length === 0 && (
                    <div className="text-center py-8 text-stone-500 text-sm">
                      No hay oportunidades en esta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDeal(null)}
        >
          <div
            className="bg-stone-800 border border-stone-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-2xl font-bold text-stone-50">{selectedDeal.name}</h3>
              <button
                onClick={() => setSelectedDeal(null)}
                className="text-stone-400 hover:text-stone-50 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Value */}
              <div className="bg-stone-700/30 rounded-lg p-4">
                <p className="text-sm text-stone-400 mb-1">Valor</p>
                <p className="text-3xl font-bold text-emerald-400">
                  {formatCurrency(parseFloat(selectedDeal.monetaryValue?.toString() || '0'))}
                </p>
              </div>

              {/* Contact */}
              {selectedDeal.contact && (
                <div className="bg-stone-700/30 rounded-lg p-4">
                  <p className="text-sm text-stone-400 mb-1">Contacto</p>
                  <p className="text-lg font-semibold text-stone-50">{selectedDeal.contact.name}</p>
                  <p className="text-sm text-stone-400">{selectedDeal.contact.email}</p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-700/30 rounded-lg p-4">
                  <p className="text-sm text-stone-400 mb-1">Creado</p>
                  <p className="text-sm font-semibold text-stone-50">
                    {new Date(selectedDeal.createdAt).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="bg-stone-700/30 rounded-lg p-4">
                  <p className="text-sm text-stone-400 mb-1">Última actualización</p>
                  <p className="text-sm font-semibold text-stone-50">
                    {getTimeAgo(selectedDeal.lastStatusChangeAt || selectedDeal.createdAt)}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                onClick={() => setSelectedDeal(null)}
              >
                Ver en GHL
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
