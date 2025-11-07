import {
  ExternalLink,
  Search,
  Calendar,
  LayoutDashboard,
  GitBranch,
  ArrowRight,
} from 'lucide-react';

interface QuickAction {
  type: string;
  label: string;
  action: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
  disabled?: boolean;
}

export function QuickActions({ actions, onActionClick, disabled }: QuickActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'navigate':
        return ArrowRight;
      case 'query':
        return Search;
      case 'calendar':
        return Calendar;
      case 'external':
        return ExternalLink;
      default:
        return ArrowRight;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('pipeline')) {
      return 'from-green-600 to-emerald-700';
    }
    if (action.includes('executive') || action.includes('dashboard')) {
      return 'from-blue-600 to-cyan-700';
    }
    if (action.includes('calendar')) {
      return 'from-amber-600 to-orange-700';
    }
    return 'from-purple-600 to-pink-700';
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-stone-700/30">
      <span className="text-xs text-stone-400 flex items-center gap-1 w-full mb-1">
        <span className="text-purple-400">✨</span> Acciones rápidas:
      </span>
      {actions.map((action, index) => {
        const Icon = getActionIcon(action.type);
        const colorClass = getActionColor(action.action);

        return (
          <button
            key={index}
            onClick={() => onActionClick(action)}
            disabled={disabled}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              disabled
                ? 'opacity-50 cursor-not-allowed bg-stone-700/20'
                : `bg-gradient-to-r ${colorClass} hover:opacity-90 active:scale-95 text-white shadow-md hover:shadow-lg`
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
