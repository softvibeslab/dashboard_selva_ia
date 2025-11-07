import {
  MessageSquare,
  History,
  BarChart3,
  LogOut,
  Shield,
  User as UserIcon,
  LayoutDashboard,
  GitBranch,
  Users,
  Zap
} from 'lucide-react';
import { User } from '../lib/supabase';

interface SidebarProps {
  user: User;
  activeView: 'chat' | 'history' | 'graphics' | 'executive' | 'pipeline' | 'contacts' | 'automations';
  onViewChange: (view: 'chat' | 'history' | 'graphics' | 'executive' | 'pipeline' | 'contacts' | 'automations') => void;
  onLogout: () => void;
}

export function Sidebar({ user, activeView, onViewChange, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'executive' as const, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pipeline' as const, icon: GitBranch, label: 'Pipeline' },
    { id: 'contacts' as const, icon: Users, label: 'Contactos 360°', badge: 'NEW' },
    { id: 'automations' as const, icon: Zap, label: 'Automatizaciones', badge: 'NEW' },
    { id: 'chat' as const, icon: MessageSquare, label: 'Chat IA' },
    { id: 'history' as const, icon: History, label: 'Historial' },
    { id: 'graphics' as const, icon: BarChart3, label: 'Gráficos' },
  ];

  return (
    <aside className="w-64 bg-stone-800/40 backdrop-blur-xl border-r border-stone-700/50 flex flex-col">
      {/* Logo Selvadentro */}
      <div className="p-6 border-b border-stone-700/50">
        <div className="flex items-center justify-center mb-6">
          <div className="flex flex-col items-center gap-2">
            <img
              src="/selva.jpg"
              alt="Selvadentro"
              className="w-16 h-16 object-contain"
            />
            <div className="text-center">
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
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                      {item.badge}
                    </span>
                  )}
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
