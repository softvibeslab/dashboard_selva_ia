import { useEffect, useState } from 'react';
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckSquare,
  MessageSquare,
  Loader2,
  Clock,
} from 'lucide-react';
import { User } from '../lib/supabase';
import { ContactActivity, getContactTimeline } from '../lib/contact-service';

interface ContactTimelineProps {
  contactId: string;
  user: User;
}

export function ContactTimeline({ contactId, user }: ContactTimelineProps) {
  const [activities, setActivities] = useState<ContactActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadTimeline();
  }, [contactId]);

  const loadTimeline = async () => {
    setLoading(true);
    const timeline = await getContactTimeline(contactId, user);
    setActivities(timeline);
    setLoading(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return Phone;
      case 'email':
        return Mail;
      case 'meeting':
        return Calendar;
      case 'note':
        return FileText;
      case 'task':
        return CheckSquare;
      case 'message':
        return MessageSquare;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'from-blue-600 to-cyan-700';
      case 'email':
        return 'from-purple-600 to-pink-700';
      case 'meeting':
        return 'from-emerald-600 to-green-700';
      case 'note':
        return 'from-amber-600 to-orange-700';
      case 'task':
        return 'from-red-600 to-rose-700';
      case 'message':
        return 'from-indigo-600 to-blue-700';
      default:
        return 'from-stone-600 to-stone-700';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    return `Hace ${Math.floor(days / 30)} meses`;
  };

  const filteredActivities =
    filter === 'all'
      ? activities
      : activities.filter((activity) => activity.type === filter);

  const activityTypes = [
    { value: 'all', label: 'Todas', count: activities.length },
    { value: 'call', label: 'Llamadas', count: activities.filter((a) => a.type === 'call').length },
    { value: 'email', label: 'Emails', count: activities.filter((a) => a.type === 'email').length },
    { value: 'meeting', label: 'Reuniones', count: activities.filter((a) => a.type === 'meeting').length },
    { value: 'task', label: 'Tareas', count: activities.filter((a) => a.type === 'task').length },
    { value: 'message', label: 'Mensajes', count: activities.filter((a) => a.type === 'message').length },
  ].filter((type) => type.count > 0);

  if (loading) {
    return (
      <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-50">Timeline de Actividades</h3>
            <p className="text-sm text-stone-400">
              {filteredActivities.length} {filteredActivities.length === 1 ? 'actividad' : 'actividades'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {activityTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              filter === type.value
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-700/30 text-stone-400 hover:bg-stone-700/50 hover:text-stone-300'
            }`}
          >
            {type.label} ({type.count})
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay actividades registradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <div
                key={activity.id}
                className="relative pl-8 pb-4 border-l-2 border-stone-700/50 last:border-l-0"
              >
                {/* Timeline dot */}
                <div className={`absolute left-0 -ml-[9px] top-0 w-4 h-4 rounded-full bg-gradient-to-br ${colorClass} border-2 border-stone-800`} />

                {/* Activity card */}
                <div className="bg-stone-700/30 border border-stone-600/30 rounded-lg p-4 hover:bg-stone-700/50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-stone-50">{activity.title}</h4>
                        {activity.user && (
                          <p className="text-xs text-stone-400">por {activity.user}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-stone-400 flex-shrink-0">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>

                  {activity.description && (
                    <p className="text-sm text-stone-300 mt-2 line-clamp-2">
                      {activity.description}
                    </p>
                  )}

                  {activity.metadata && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activity.metadata.status && (
                        <span className="text-xs bg-stone-600/30 text-stone-400 px-2 py-1 rounded">
                          {activity.metadata.status}
                        </span>
                      )}
                      {activity.metadata.completed && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                          Completado
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
