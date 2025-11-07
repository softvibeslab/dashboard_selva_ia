import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Users, Target, Calendar, AlertTriangle } from 'lucide-react';
import { User } from '../lib/supabase';
import { generateSuggestedQuestions } from '../lib/conversation-context';

interface SuggestedQuestionsProps {
  user: User;
  onQuestionClick: (question: string) => void;
  disabled?: boolean;
}

export function SuggestedQuestions({ user, onQuestionClick, disabled }: SuggestedQuestionsProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Generar sugerencias basadas en contexto
    const suggestions = generateSuggestedQuestions(user);
    setQuestions(suggestions);
  }, [user]);

  const getQuestionIcon = (question: string) => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('dashboard') || lowerQuestion.includes('team')) {
      return TrendingUp;
    }
    if (lowerQuestion.includes('pipeline') || lowerQuestion.includes('deal')) {
      return Target;
    }
    if (lowerQuestion.includes('tarea') || lowerQuestion.includes('calendario')) {
      return Calendar;
    }
    if (lowerQuestion.includes('riesgo') || lowerQuestion.includes('atrasado')) {
      return AlertTriangle;
    }
    if (lowerQuestion.includes('lead') || lowerQuestion.includes('contacto')) {
      return Users;
    }

    return Sparkles;
  };

  const displayedQuestions = expanded ? questions : questions.slice(0, 3);

  return (
    <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-stone-50">Preguntas Sugeridas</h3>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {displayedQuestions.map((question, index) => {
          const Icon = getQuestionIcon(question);
          return (
            <button
              key={index}
              onClick={() => onQuestionClick(question)}
              disabled={disabled}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                disabled
                  ? 'opacity-50 cursor-not-allowed bg-stone-700/20 border-stone-700/30'
                  : 'bg-stone-700/30 border-stone-600/30 hover:bg-stone-700/50 hover:border-purple-500/30 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-stone-300 group-hover:text-stone-50">
                {question}
              </span>
            </button>
          );
        })}
      </div>

      {questions.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 text-xs text-purple-400 hover:text-purple-300 font-semibold py-2 border-t border-stone-700/30"
        >
          {expanded ? 'Ver menos' : `Ver más (${questions.length - 3})`}
        </button>
      )}
    </div>
  );
}
