import { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { Sidebar } from './Sidebar';
import { MetricsWidget } from './MetricsWidget';
import { HistoryView } from './HistoryView';
import { GraphicsView } from './GraphicsView';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { PipelineView } from './PipelineView';
import { ContactsView } from './ContactsView';
import { User } from '../lib/supabase';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeView, setActiveView] = useState<'chat' | 'history' | 'graphics' | 'executive' | 'pipeline' | 'contacts'>('executive');

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-neutral-800 to-stone-900">
      <div className="flex h-screen">
        <Sidebar
          user={user}
          activeView={activeView}
          onViewChange={setActiveView}
          onLogout={onLogout}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-stone-800/40 backdrop-blur-lg border-b border-stone-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-stone-50">
                  Bienvenido, {user.full_name}
                </h1>
                <p className="text-stone-300 text-sm">
                  {user.role === 'admin' ? 'Administrador' : 'Broker'} | Selvadentro Tulum
                </p>
              </div>
              <MetricsWidget user={user} />
            </div>
          </header>

          <main className="flex-1 overflow-hidden">
            {activeView === 'chat' && <ChatInterface user={user} onNavigate={setActiveView} />}
            {activeView === 'history' && <HistoryView user={user} />}
            {activeView === 'graphics' && <GraphicsView user={user} />}
            {activeView === 'executive' && <ExecutiveDashboard user={user} />}
            {activeView === 'pipeline' && <PipelineView user={user} />}
            {activeView === 'contacts' && <ContactsView user={user} />}
          </main>
        </div>
      </div>
    </div>
  );
}
