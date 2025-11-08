import { useState } from 'react';
import { Zap, Flame, Calendar, Settings } from 'lucide-react';
import { User } from '../lib/supabase';
import { HotLeadDetector } from './HotLeadDetector';
import { FollowUpSuggestions } from './FollowUpSuggestions';
import { AutoAssignmentPanel } from './AutoAssignmentPanel';

interface AutomationsViewProps {
  user: User;
}

type AutomationTab = 'hot-leads' | 'follow-ups' | 'auto-assign' | 'rules';

export function AutomationsView({ user }: AutomationsViewProps) {
  const [activeTab, setActiveTab] = useState<AutomationTab>('hot-leads');

  const tabs = [
    { id: 'hot-leads' as const, icon: Flame, label: 'Hot Leads', badge: 'NEW' },
    { id: 'follow-ups' as const, icon: Calendar, label: 'Follow-ups' },
    { id: 'auto-assign' as const, icon: Zap, label: 'Auto-Asignación' },
    { id: 'rules' as const, icon: Settings, label: 'Reglas', disabled: true },
  ];

  return (
    <div className="h-full flex flex-col p-6 bg-stone-900">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-stone-50 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-700 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          Automatizaciones Inteligentes
        </h2>
        <p className="text-stone-400">
          IA que trabaja por ti 24/7 - Detecta oportunidades y sugiere acciones
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-stone-700/50 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : tab.disabled
                  ? 'bg-stone-700/20 text-stone-600 cursor-not-allowed'
                  : 'bg-stone-700/30 text-stone-400 hover:bg-stone-700/50 hover:text-stone-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'hot-leads' && <HotLeadDetector user={user} />}
        {activeTab === 'follow-ups' && <FollowUpSuggestions user={user} />}
        {activeTab === 'auto-assign' && <AutoAssignmentPanel user={user} />}
        {activeTab === 'rules' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Settings className="w-16 h-16 text-stone-600 mx-auto mb-4" />
              <p className="text-stone-400">Configuración de reglas - Próximamente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
