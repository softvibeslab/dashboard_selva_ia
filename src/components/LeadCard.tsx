import { Mail, Phone, MessageCircle, Eye, Calendar, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface LeadCardProps {
  lead: any;
  onGenerateScript: (lead: any) => void;
}

export function LeadCard({ lead, onGenerateScript }: LeadCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'qualified': 'bg-green-500/20 text-green-400 border-green-500/30',
      'new': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'contacted': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'negotiation': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'lost': 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status?.toLowerCase()] || 'bg-stone-500/20 text-stone-400 border-stone-500/30';
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const name = lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Sin nombre';
  const email = lead.email || lead.contactInfo?.email || '';
  const phone = lead.phone || lead.contactInfo?.phone || '';
  const source = lead.source || lead.customField?.find((f: any) => f.key === 'source')?.value || 'No especificado';
  const status = lead.tags?.[0] || lead.status || 'new';
  const opportunity = lead.opportunity || lead.monetaryValue;
  const nextAction = lead.nextAction || 'Contactar al prospecto';
  const nextActionDate = lead.nextActionDate || lead.dateAdded;

  return (
    <div className="bg-stone-800/60 backdrop-blur-lg border border-stone-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-green-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-50">{name}</h3>
            <p className="text-sm text-stone-400">{source}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {email && (
          <div className="flex items-center gap-2 text-stone-300">
            <Mail className="w-4 h-4 text-stone-400" />
            <span className="text-sm">{email}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 text-stone-300">
            <Phone className="w-4 h-4 text-stone-400" />
            <span className="text-sm">{phone}</span>
          </div>
        )}
        {opportunity && (
          <div className="flex items-center gap-2 text-stone-300">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-400">{formatCurrency(opportunity)}</span>
          </div>
        )}
      </div>

      {lead.analysis && (
        <div className="bg-stone-900/50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-stone-400">Análisis IA</span>
            <span className="text-sm font-bold text-emerald-400">{lead.analysis.intent || '85%'} intención</span>
          </div>
          <p className="text-sm text-stone-300">{lead.analysis.nextStep || nextAction}</p>
        </div>
      )}

      <div className="border-t border-stone-700/50 pt-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-400">Próxima acción:</span>
          <div className="flex items-center gap-2 text-sm text-stone-300">
            <Calendar className="w-4 h-4 text-stone-400" />
            {nextActionDate ? new Date(nextActionDate).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Sin fecha'}
          </div>
        </div>
        <p className="text-sm text-stone-300 mt-1">{nextAction}</p>
      </div>

      <div className="flex items-center gap-2">
        {phone && (
          <>
            <a
              href={`tel:${formatPhone(phone)}`}
              className="flex-1 bg-stone-700/50 hover:bg-stone-700 text-stone-200 p-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              title="Llamar"
            >
              <Phone className="w-4 h-4" />
            </a>
            <a
              href={`https://wa.me/${formatPhone(phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 p-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex-1 bg-stone-700/50 hover:bg-stone-700 text-stone-200 p-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            title="Email"
          >
            <Mail className="w-4 h-4" />
          </a>
        )}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 bg-stone-700/50 hover:bg-stone-700 text-stone-200 p-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          title="Ver detalle"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onGenerateScript(lead)}
          className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 p-2 rounded-lg transition-colors text-sm font-medium"
        >
          Ver Script
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-stone-700/50 space-y-2">
          <h4 className="text-sm font-semibold text-stone-300 mb-2">Detalles Completos</h4>
          <div className="bg-stone-900/50 rounded-lg p-3">
            <pre className="text-xs text-stone-400 overflow-auto max-h-48">
              {JSON.stringify(lead, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
