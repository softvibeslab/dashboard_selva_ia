import { useEffect, useState } from 'react';
import { Calendar, Loader2, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { User } from '../lib/supabase';
import { FollowUpSuggestion, generateFollowUpSuggestions } from '../lib/automation-service';

interface FollowUpSuggestionsProps {
  user: User;
}

export function FollowUpSuggestions({ user }: FollowUpSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadSuggestions();
  }, [user]);

  const loadSuggestions = async () => {
    setLoading(true);
    const data = await generateFollowUpSuggestions(user);
    setSuggestions(data);
    setLoading(false);
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
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
      case 'low':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          badge: 'bg-blue-500/20',
        };
    }
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return AlertCircle;
      case 'medium':
        return Clock;
      case 'low':
        return CheckCircle;
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

  const filteredSuggestions =
    filter === 'all'
      ? suggestions
      : suggestions.filter((s) => s.priority === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-300">Analizando oportunidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Stats Header */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-stone-800/40 border border-stone-700/50 rounded-xl p-4">
          <p className="text-sm text-stone-400 mb-1">Total</p>
          <p className="text-3xl font-bold text-stone-50">{suggestions.length}</p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-sm text-stone-400 mb-1">Alta Prioridad</p>
          <p className="text-3xl font-bold text-red-400">
            {suggestions.filter((s) => s.priority === 'high').length}
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-sm text-stone-400 mb-1">Media Prioridad</p>
          <p className="text-3xl font-bold text-amber-400">
            {suggestions.filter((s) => s.priority === 'medium').length}
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-sm text-stone-400 mb-1">Baja Prioridad</p>
          <p className="text-3xl font-bold text-blue-400">
            {suggestions.filter((s) => s.priority === 'low').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'high', 'medium', 'low'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-stone-700/30 text-stone-400 hover:bg-stone-700/50'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'high' ? 'Alta' : f === 'medium' ? 'Media' : 'Baja'}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSuggestions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-stone-600 mx-auto mb-4" />
              <p className="text-stone-400">No hay sugerencias de follow-up</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSuggestions.map((suggestion) => {
              const colors = getPriorityColor(suggestion.priority);
              const Icon = getPriorityIcon(suggestion.priority);

              return (
                <div
                  key={`${suggestion.contactId}-${suggestion.dealId}`}
                  className={`${colors.bg} ${colors.border} border rounded-xl p-4`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                        <h3 className="text-sm font-semibold text-stone-50">{suggestion.name}</h3>
                        <span
                          className={`${colors.badge} ${colors.text} text-xs px-2 py-0.5 rounded-full font-semibold`}
                        >
                          {suggestion.priority.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-stone-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {suggestion.daysSinceLastContact} días sin contacto
                        </div>

                        {suggestion.dealValue && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatCurrency(suggestion.dealValue)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="mb-3">
                    <p className="text-xs text-stone-400 mb-1">Razón:</p>
                    <p className="text-sm text-stone-300">{suggestion.reason}</p>
                  </div>

                  {/* Suggested Action */}
                  <div className={`mt-3 pt-3 border-t ${colors.border}`}>
                    <p className="text-xs text-stone-400 mb-1">Acción sugerida:</p>
                    <p className="text-sm font-semibold text-emerald-400">
                      👉 {suggestion.suggestedAction}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-semibold transition-all">
                    Ejecutar Acción
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-4 pt-4 border-t border-stone-700/30">
        <button
          onClick={loadSuggestions}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5" />
              Generar Sugerencias
            </>
          )}
        </button>
      </div>
    </div>
  );
}
