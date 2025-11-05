import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { User, supabase } from '../lib/supabase';
import { processQuery } from '../lib/ai-processor';
import { processWithAI } from '../lib/ai-service';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  user: User;
}

export function ChatInterface({ user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hola ${user.full_name}! Soy tu asistente de Selvadentro Tulum. Puedo ayudarte con:\n\n- Estadísticas de ventas y conversión\n- Información sobre leads y oportunidades\n- Datos de lotes disponibles\n- Métricas de performance\n- Información del desarrollo\n\n¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const hasAnthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

      let response: string;
      let queryType: string;

      if (hasAnthropicKey) {
        const aiResult = await processWithAI(input, user);
        response = aiResult.response;
        queryType = aiResult.queryType;
      } else {
        const result = await processQuery(input, user);
        response = result.response;
        queryType = result.queryType;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await supabase.from('chat_history').insert({
        user_id: user.id,
        query: input,
        response: response,
        query_type: queryType,
      });
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error. Por favor, intenta nuevamente.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white'
                  : 'bg-stone-800/60 backdrop-blur-lg border border-stone-700/50 text-stone-50'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-emerald-500 font-semibold">AI Assistant</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-stone-800/60 backdrop-blur-lg border border-stone-700/50 rounded-2xl p-4">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-2xl p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre ventas, leads, oportunidades..."
            disabled={loading}
            className="flex-1 bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-3 text-stone-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
