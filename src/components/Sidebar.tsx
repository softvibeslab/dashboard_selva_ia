import { MessageSquare, History, BarChart3, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { User } from '../lib/supabase';

interface SidebarProps {
  user: User;
  activeView: 'chat' | 'history' | 'graphics';
  onViewChange: (view: 'chat' | 'history' | 'graphics') => void;
  onLogout: () => void;
}

export function Sidebar({ user, activeView, onViewChange, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'chat' as const, icon: MessageSquare, label: 'Chat Query' },
    { id: 'history' as const, icon: History, label: 'Historial' },
    { id: 'graphics' as const, icon: BarChart3, label: 'Gráficos' },
  ];

  return (
    <aside className="w-64 bg-stone-800/40 backdrop-blur-xl border-r border-stone-700/50 flex flex-col">
      {/* Logo Selvadentro */}
      <div className="p-6 border-b border-stone-700/50">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-50">Selvadentro</h2>
              <p className="text-xs text-stone-400">Tulum</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-stone-700/50">
        <div className="flex items-center gap-3">
          {user.profile_photo ? (
            <img
              src={user.profile_photo}
              alt={user.full_name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-600/50 shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl flex items-center justify-center ${user.profile_photo ? 'hidden' : ''}`}>
            {user.role === 'admin' ? (
              <Shield className="w-6 h-6 text-white" />
            ) : (
              <UserIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-stone-50 font-semibold text-sm truncate">{user.full_name}</p>
            <p className="text-stone-400 text-xs">
              {user.role === 'admin' ? 'Admin' : 'Broker'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                      : 'text-stone-300 hover:bg-stone-700/30 hover:text-stone-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-stone-700/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-orange-300 hover:bg-orange-600/10 hover:text-orange-200 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
