import { useState } from 'react';
import { UserPlus, Tag, Globe, DollarSign, Check, X } from 'lucide-react';
import { User } from '../lib/supabase';
import { AssignmentRule, getSavedAssignmentRules } from '../lib/automation-service';

interface AutoAssignmentPanelProps {
  user: User;
}

export function AutoAssignmentPanel({ user }: AutoAssignmentPanelProps) {
  const [rules, setRules] = useState<AssignmentRule[]>(getSavedAssignmentRules());

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Info */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-50 mb-1">
              Auto-Asignación Inteligente
            </h3>
            <p className="text-xs text-stone-400">
              Configura reglas para asignar automáticamente nuevos leads a los brokers correctos
              basándote en tags, fuente, valor y más.
            </p>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`bg-stone-800/40 border ${
              rule.enabled ? 'border-emerald-500/30' : 'border-stone-700/50'
            } rounded-xl p-4 transition-all`}
          >
            {/* Rule Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-stone-50">{rule.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      rule.enabled
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-stone-600/20 text-stone-400'
                    }`}
                  >
                    {rule.enabled ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <p className="text-sm text-stone-400">
                  Asignar a: <span className="text-emerald-400 font-semibold">{rule.assignToName}</span>
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleRule(rule.id)}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  rule.enabled ? 'bg-emerald-600' : 'bg-stone-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                    rule.enabled ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Criteria */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-400 mb-2">Criterios:</p>

              {rule.criteria.tags && rule.criteria.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="text-sm text-stone-300">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {rule.criteria.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {rule.criteria.source && rule.criteria.source.length > 0 && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-stone-300">Fuente:</span>
                  <div className="flex flex-wrap gap-1">
                    {rule.criteria.source.map((source, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(rule.criteria.valueMin || rule.criteria.valueMax) && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-stone-300">
                    Valor: ${rule.criteria.valueMin || 0} - ${rule.criteria.valueMax || '∞'}
                  </span>
                </div>
              )}
            </div>

            {/* Example */}
            <div className="mt-4 pt-4 border-t border-stone-700/30">
              <p className="text-xs text-stone-500 italic">
                Ejemplo: Un lead con tag "VIP" se asignará automáticamente a {rule.assignToName}
              </p>
            </div>
          </div>
        ))}

        {/* Add Rule Button */}
        <button className="w-full border-2 border-dashed border-stone-700 hover:border-purple-500/50 rounded-xl p-6 text-stone-400 hover:text-purple-400 transition-all flex items-center justify-center gap-2">
          <UserPlus className="w-5 h-5" />
          Agregar Nueva Regla
        </button>
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-stone-700/30">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {rules.filter((r) => r.enabled).length}
            </p>
            <p className="text-xs text-stone-400">Reglas Activas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-stone-400">
              {rules.filter((r) => !r.enabled).length}
            </p>
            <p className="text-xs text-stone-400">Reglas Inactivas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
