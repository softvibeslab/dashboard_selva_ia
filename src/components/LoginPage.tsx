import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: users, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (dbError) throw dbError;

      if (!users) {
        setError('Email no encontrado. Contacta al administrador.');
        setLoading(false);
        return;
      }

      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', users.id);

      localStorage.setItem('selvadentro_user', JSON.stringify(users));
      onLogin(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-neutral-800 to-stone-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-stone-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-700/50 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-stone-50 mb-2">Selvadentro Tulum</h1>
            <p className="text-stone-400">Dashboard de Agentes</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Email Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu-email@selvadentrotulum.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-stone-800/60 border border-stone-700/50 rounded-xl text-stone-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-orange-600/20 border border-orange-600/50 rounded-xl p-3 text-orange-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-400">
            <p className="mb-2">Usuarios de prueba:</p>
            <p className="text-xs">mmolina@selvadentrotulum.com</p>
            <p className="text-xs">admin@selvadentrotulum.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
