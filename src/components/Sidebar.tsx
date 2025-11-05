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
    <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          {user.profile_photo ? (
            <img
              src={user.profile_photo}
              alt={user.full_name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400/50 shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center ${user.profile_photo ? 'hidden' : ''}`}>
            {user.role === 'admin' ? (
              <Shield className="w-6 h-6 text-white" />
            ) : (
              <UserIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user.full_name}</p>
            <p className="text-blue-300 text-xs">
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
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-blue-200 hover:bg-white/5 hover:text-white'
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

      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
