import { useEffect, useState } from 'react';
import { Flame, Loader2, Mail, Phone, TrendingUp, ExternalLink } from 'lucide-react';
import { User } from '../lib/supabase';
import { HotLead, detectHotLeads } from '../lib/automation-service';

interface HotLeadDetectorProps {
  user: User;
}

export function HotLeadDetector({ user }: HotLeadDetectorProps) {
  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotLeads();
  }, [user]);

  const loadHotLeads = async () => {
    setLoading(true);
    const leads = await detectHotLeads(user);
    setHotLeads(leads);
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-red-600 to-orange-700';
    if (score >= 60) return 'from-orange-600 to-amber-700';
    return 'from-amber-600 to-yellow-700';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-red-500/10 border-red-500/30';
    if (score >= 60) return 'bg-orange-500/10 border-orange-500/30';
    return 'bg-amber-500/10 border-amber-500/30';
  };

  const getScoreLabel = (level: 'hot' | 'warm' | 'cold') => {
    switch (level) {
      case 'hot':
        return '🔥 CALIENTE';
      case 'warm':
        return '🌡️ TIBIO';
      case 'cold':
        return '❄️ FRÍO';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-300">Analizando leads con IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-red-400" />
            <span className="text-sm text-stone-400">Hot (≥80)</span>
          </div>
          <p className="text-3xl font-bold text-red-400">
            {hotLeads.filter((l) => l.score >= 80).length}
          </p>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-stone-400">Warm (60-79)</span>
          </div>
          <p className="text-3xl font-bold text-orange-400">
            {hotLeads.filter((l) => l.score >= 60 && l.score < 80).length}
          </p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-stone-400">Total Detectados</span>
          </div>
          <p className="text-3xl font-bold text-purple-400">{hotLeads.length}</p>
        </div>
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-y-auto">
        {hotLeads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Flame className="w-16 h-16 text-stone-600 mx-auto mb-4" />
              <p className="text-stone-400 mb-2">No se detectaron hot leads</p>
              <p className="text-sm text-stone-500">
                Los leads con score ≥60 aparecerán aquí automáticamente
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {hotLeads.map((lead, index) => (
              <div
                key={lead.contactId}
                className={`${getScoreBg(lead.score)} border backdrop-blur-lg rounded-xl p-4 hover:scale-[1.01] transition-all`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">#{index + 1}</span>
                      <h3 className="text-lg font-semibold text-stone-50">{lead.name}</h3>
                      <span className="text-xs font-bold px-2 py-1 bg-stone-900/50 rounded-full">
                        {getScoreLabel(lead.level)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      {lead.email && (
                        <div className="flex items-center gap-1 text-stone-300">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score Circle */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        stroke="currentColor"
                        strokeWidth="5"
                        fill="none"
                        className="text-stone-700/30"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        stroke="url(#gradient)"
                        strokeWidth="5"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 35}`}
                        strokeDashoffset={`${2 * Math.PI * 35 * (1 - lead.score / 100)}`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#DC2626" />
                          <stop offset="100%" stopColor="#F97316" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-stone-50">{lead.score}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reasons */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-stone-400 mb-2">Por qué es hot:</p>
                  <div className="flex flex-wrap gap-2">
                    {lead.reasons.map((reason, i) => (
                      <span
                        key={i}
                        className="text-xs bg-stone-700/30 text-stone-300 px-2 py-1 rounded"
                      >
                        ✓ {reason}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggested Action */}
                <div className={`mt-3 pt-3 border-t ${lead.score >= 80 ? 'border-red-500/20' : 'border-orange-500/20'}`}>
                  <p className="text-xs text-stone-400 mb-2">Acción sugerida:</p>
                  <p className="text-sm font-semibold text-emerald-400">
                    👉 {lead.suggestedAction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-4 pt-4 border-t border-stone-700/30">
        <button
          onClick={loadHotLeads}
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
              <Flame className="w-5 h-5" />
              Detectar Hot Leads
            </>
          )}
        </button>
      </div>
    </div>
  );
}
