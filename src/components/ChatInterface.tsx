import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, FileText, Trash2 } from 'lucide-react';
import { User, supabase } from '../lib/supabase';
import { processQuery } from '../lib/ai-processor';
import { processWithAI } from '../lib/ai-service';
import { SuggestedQuestions } from './SuggestedQuestions';
import { QuickActions } from './QuickActions';
import {
  getConversationContext,
  addMessageToContext,
  getContextForAI,
  generateContextSummary,
  clearConversationContext,
  analyzeMessageForQuickActions,
} from '../lib/conversation-context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickActions?: { type: string; label: string; action: string }[];
}

interface ChatInterfaceProps {
  user: User;
  onNavigate?: (view: string) => void;
}

export function ChatInterface({ user, onNavigate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hola ${user.full_name}! Soy tu asistente inteligente de Selvadentro Tulum. 🌿\n\nPuedo ayudarte con:\n\n- 📊 Dashboard y métricas en tiempo real\n- 💰 Pipeline y oportunidades\n- 👥 Información de leads y contactos\n- 📅 Calendario y tareas\n- 📈 Análisis y reportes\n\nTengo memoria de nuestra conversación y puedo ofrecerte sugerencias personalizadas.\n\n¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showContextSummary, setShowContextSummary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar contexto de conversación
  useEffect(() => {
    getConversationContext(user);
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();

    const queryText = customQuery || input;
    if (!queryText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: queryText,
      timestamp: new Date(),
    };

    // Agregar mensaje al contexto de conversación
    addMessageToContext(user.id, {
      role: 'user',
      content: queryText,
      timestamp: userMessage.timestamp,
    });

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const hasAnthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

      // Obtener contexto de conversación para incluir en el query
      const conversationContext = getContextForAI(user.id);

      let response: string;
      let queryType: string;

      // Agregar contexto al query si hay conversación previa
      const enhancedQuery = conversationContext
        ? `${queryText}${conversationContext}`
        : queryText;

      if (hasAnthropicKey) {
        const aiResult = await processWithAI(enhancedQuery, user);
        response = aiResult.response;
        queryType = aiResult.queryType;
      } else {
        const result = await processQuery(enhancedQuery, user);
        response = result.response;
        queryType = result.queryType;
      }

      // Analizar respuesta para generar acciones rápidas
      const quickActions = analyzeMessageForQuickActions(queryText);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        quickActions: quickActions.length > 0 ? quickActions : undefined,
      };

      // Agregar respuesta al contexto
      addMessageToContext(user.id, {
        role: 'assistant',
        content: response,
        timestamp: assistantMessage.timestamp,
        metadata: {
          queryType,
        },
      });

      setMessages((prev) => [...prev, assistantMessage]);

      await supabase.from('chat_history').insert({
        user_id: user.id,
        query: queryText,
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

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    handleSubmit(undefined, question);
  };

  const handleQuickAction = (action: { type: string; label: string; action: string }) => {
    if (action.type === 'navigate' && onNavigate) {
      onNavigate(action.action);
    } else if (action.type === 'query') {
      handleSubmit(undefined, action.label);
    }
  };

  const handleClearContext = () => {
    if (confirm('¿Estás seguro de limpiar el contexto de la conversación?')) {
      clearConversationContext(user.id);
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Contexto limpiado. Comenzamos una nueva conversación. ¿En qué puedo ayudarte?`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const contextSummary = generateContextSummary(user.id);

  return (
    <div className="h-full flex gap-4 p-6 bg-stone-900">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Context Summary Banner */}
        {contextSummary && messages.length > 2 && (
          <div className="mb-4 bg-purple-500/10 border border-purple-500/30 backdrop-blur-lg rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <button
                  onClick={() => setShowContextSummary(!showContextSummary)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  {showContextSummary ? 'Ocultar contexto' : 'Ver contexto de conversación'}
                </button>
              </div>
              <button
                onClick={handleClearContext}
                className="text-xs text-stone-400 hover:text-red-400 flex items-center gap-1"
                title="Limpiar contexto"
              >
                <Trash2 className="w-3 h-3" />
                Limpiar
              </button>
            </div>
            {showContextSummary && (
              <div className="mt-2 text-xs text-stone-300 whitespace-pre-wrap">
                {contextSummary}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
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
                    <span className="text-xs text-emerald-500 font-semibold">
                      AI Assistant 🧠
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>

                {/* Quick Actions */}
                {message.role === 'assistant' && message.quickActions && (
                  <QuickActions
                    actions={message.quickActions}
                    onActionClick={handleQuickAction}
                    disabled={loading}
                  />
                )}
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

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-2xl p-4"
        >
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

      {/* Sidebar with Suggested Questions */}
      <div className="w-80 flex-shrink-0">
        <SuggestedQuestions
          user={user}
          onQuestionClick={handleSuggestedQuestion}
          disabled={loading}
        />
      </div>
    </div>
  );
}
