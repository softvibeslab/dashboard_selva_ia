import { useEffect, useState } from 'react';
import { supabase, ChatHistory, User } from '../lib/supabase';
import { Clock, Search, MessageSquare, Filter } from 'lucide-react';

interface HistoryViewProps {
  user: User;
}

export function HistoryView({ user }: HistoryViewProps) {
  const [messages, setMessages] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadHistory();
  }, [user.id]);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = msg.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.response.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || msg.query_type === filterType;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = Array.from(new Set(messages.map(m => m.query_type)));

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-stone-50 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 bg-stone-900">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-50 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Historial de Consultas
        </h2>

        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en historial..."
              className="w-full pl-10 pr-4 py-3 bg-stone-800/60 border border-stone-700/50 rounded-xl text-stone-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-3 bg-stone-800/60 border border-stone-700/50 rounded-xl text-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 appearance-none cursor-pointer"
            >
              <option value="all">Todos</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-stone-400 text-sm">
          {filteredMessages.length} {filteredMessages.length === 1 ? 'consulta' : 'consultas'} encontradas
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-stone-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No hay consultas en el historial</p>
              <p className="text-sm mt-2">Tus consultas aparecerán aquí</p>
            </div>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-4 hover:bg-stone-800/60 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded-lg text-xs font-medium">
                    {msg.query_type}
                  </span>
                  <div className="flex items-center gap-1 text-stone-400 text-xs">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.created_at).toLocaleString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-stone-400 mb-1">Consulta:</p>
                  <p className="text-stone-50 text-sm">{msg.query}</p>
                </div>

                <div>
                  <p className="text-xs text-stone-400 mb-1">Respuesta:</p>
                  <p className="text-stone-300 text-sm line-clamp-3">{msg.response}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
