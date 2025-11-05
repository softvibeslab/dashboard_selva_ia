import { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { Sidebar } from './Sidebar';
import { MetricsWidget } from './MetricsWidget';
import { HistoryView } from './HistoryView';
import { GraphicsView } from './GraphicsView';
import { User } from '../lib/supabase';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeView, setActiveView] = useState<'chat' | 'history' | 'graphics'>('chat');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex h-screen">
        <Sidebar
          user={user}
          activeView={activeView}
          onViewChange={setActiveView}
          onLogout={onLogout}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/5 backdrop-blur-lg border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Bienvenido, {user.full_name}
                </h1>
                <p className="text-blue-200 text-sm">
                  {user.role === 'admin' ? 'Administrador' : 'Broker'} | Selvadentro Tulum
                </p>
              </div>
              <MetricsWidget user={user} />
            </div>
          </header>

          <main className="flex-1 overflow-hidden">
            {activeView === 'chat' && <ChatInterface user={user} />}
            {activeView === 'history' && <HistoryView user={user} />}
            {activeView === 'graphics' && <GraphicsView user={user} />}
          </main>
        </div>
      </div>
    </div>
  );
}
