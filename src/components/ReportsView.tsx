import { useState } from 'react';
import { FileText, Calendar, History, Settings } from 'lucide-react';
import { User } from '../lib/supabase';
import { ReportGenerator } from './ReportGenerator';
import { ReportScheduler } from './ReportScheduler';
import { ReportHistory } from './ReportHistory';

interface ReportsViewProps {
  user: User;
}

type TabType = 'generate' | 'schedule' | 'history' | 'settings';

export function ReportsView({ user }: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('generate');

  const tabs = [
    { id: 'generate' as const, label: 'Generar Reporte', icon: FileText },
    { id: 'schedule' as const, label: 'Programar', icon: Calendar },
    { id: 'history' as const, label: 'Historial', icon: History },
  ];

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-stone-900 via-neutral-800 to-stone-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-50">Reportes Automáticos</h1>
              <p className="text-stone-400">Genera, programa y gestiona reportes personalizados</p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 p-1 bg-stone-800/40 backdrop-blur-lg rounded-xl border border-stone-700/50 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-700/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-stone-800/40 backdrop-blur-xl rounded-2xl border border-stone-700/50 p-6">
          {activeTab === 'generate' && <ReportGenerator user={user} />}
          {activeTab === 'schedule' && <ReportScheduler user={user} />}
          {activeTab === 'history' && <ReportHistory user={user} />}
        </div>
      </div>
    </div>
  );
}
