import { useEffect, useState } from 'react';
import { Target, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { User } from '../lib/supabase';
import {
  ContactOpportunity,
  ContactStats,
  getContactOpportunities,
  getContactStats,
  calculateDealScore,
} from '../lib/contact-service';

interface DealScorePredictorProps {
  contactId: string;
  user: User;
}

interface DealWithScore extends ContactOpportunity {
  score: number;
  level: 'high' | 'medium' | 'low';
  factors: string[];
}

export function DealScorePredictor({ contactId, user }: DealScorePredictorProps) {
  const [dealsWithScores, setDealsWithScores] = useState<DealWithScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScores();
  }, [contactId]);

  const loadScores = async () => {
    setLoading(true);

    const [opportunities, stats] = await Promise.all([
      getContactOpportunities(contactId, user),
      getContactStats(contactId, user),
    ]);

    // Solo deals activos
    const activeDeals = opportunities.filter(
      (opp) => opp.status !== 'won' && opp.status !== 'lost'
    );

    const dealsWithScores = activeDeals.map((opp) => {
      const { score, level, factors } = calculateDealScore(opp, stats);
      return {
        ...opp,
        score,
        level,
        factors,
      };
    });

    // Ordenar por score (mayor primero)
    dealsWithScores.sort((a, b) => b.score - a.score);

    setDealsWithScores(dealsWithScores);
    setLoading(false);
  };

  const getScoreColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20',
          gradient: 'from-emerald-600 to-green-700',
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20',
          gradient: 'from-amber-600 to-orange-700',
        };
      case 'low':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          badge: 'bg-red-500/20',
          gradient: 'from-red-600 to-rose-700',
        };
    }
  };

  const getScoreIcon = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return TrendingUp;
      case 'medium':
        return Minus;
      case 'low':
        return TrendingDown;
    }
  };

  const getScoreLabel = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return 'Alta Probabilidad';
      case 'medium':
        return 'Probabilidad Media';
      case 'low':
        return 'Probabilidad Baja';
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

  if (loading) {
    return (
      <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (dealsWithScores.length === 0) {
    return (
      <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-50">Score Predictivo de Cierre</h3>
            <p className="text-sm text-stone-400">Análisis con IA</p>
          </div>
        </div>
        <div className="text-center py-8 text-stone-400">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay deals activos para analizar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-50">Score Predictivo de Cierre</h3>
          <p className="text-sm text-stone-400">
            {dealsWithScores.length} {dealsWithScores.length === 1 ? 'deal activo' : 'deals activos'}
          </p>
        </div>
      </div>

      {/* Deals List */}
      <div className="space-y-4">
        {dealsWithScores.map((deal) => {
          const colors = getScoreColor(deal.level);
          const ScoreIcon = getScoreIcon(deal.level);

          return (
            <div
              key={deal.id}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-stone-50">{deal.name}</h4>
                    <span
                      className={`${colors.badge} ${colors.text} text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1`}
                    >
                      <ScoreIcon className="w-3 h-3" />
                      {getScoreLabel(deal.level)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-stone-300">
                      💰 {formatCurrency(deal.value)}
                    </span>
                    <span className="text-stone-400">
                      📍 {deal.stage}
                    </span>
                  </div>
                </div>

                {/* Score Circle */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-stone-700/30"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - deal.score / 100)}`}
                      className={colors.text}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold ${colors.text}`}>
                      {deal.score}
                    </span>
                  </div>
                </div>
              </div>

              {/* Factors */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-stone-400 mb-2">Factores del score:</p>
                {deal.factors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-emerald-400 text-xs mt-0.5">✓</span>
                    <span className="text-xs text-stone-300">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-stone-700/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-400">
              {dealsWithScores.filter((d) => d.level === 'high').length}
            </p>
            <p className="text-xs text-stone-400">Alta Prob.</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">
              {dealsWithScores.filter((d) => d.level === 'medium').length}
            </p>
            <p className="text-xs text-stone-400">Media Prob.</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">
              {dealsWithScores.filter((d) => d.level === 'low').length}
            </p>
            <p className="text-xs text-stone-400">Baja Prob.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
