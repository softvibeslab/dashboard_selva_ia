import { useEffect, useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Tag,
  Calendar,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { User } from '../lib/supabase';
import {
  Contact,
  ContactStats,
  getContactDetails,
  getContactStats,
} from '../lib/contact-service';
import { ContactTimeline } from './ContactTimeline';
import { ActivityHeatmap } from './ActivityHeatmap';
import { DealScorePredictor } from './DealScorePredictor';

interface ContactDetailViewProps {
  contactId: string;
  user: User;
  onBack: () => void;
}

export function ContactDetailView({ contactId, user, onBack }: ContactDetailViewProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContactData();
  }, [contactId]);

  const loadContactData = async () => {
    setLoading(true);

    const [contactData, statsData] = await Promise.all([
      getContactDetails(contactId, user),
      getContactStats(contactId, user),
    ]);

    setContact(contactData);
    setStats(statsData);
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-300">Cargando vista 360° del contacto...</p>
        </div>
      </div>
    );
  }

  if (!contact || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-stone-300">No se pudo cargar el contacto</p>
          <button
            onClick={onBack}
            className="mt-4 text-emerald-400 hover:text-emerald-300"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      icon: DollarSign,
      label: 'Lifetime Value',
      value: formatCurrency(stats.lifetimeValue),
      color: 'from-emerald-600 to-green-700',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Win Rate',
      value: `${stats.winRate.toFixed(0)}%`,
      color: 'from-blue-600 to-cyan-700',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      icon: UserIcon,
      label: 'Deals Activos',
      value: stats.activeDeals,
      color: 'from-purple-600 to-pink-700',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      icon: Calendar,
      label: 'Última Interacción',
      value: stats.lastInteractionDays === 0 ? 'Hoy' : `Hace ${stats.lastInteractionDays}d`,
      color: 'from-amber-600 to-orange-700',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-stone-900">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-stone-800/60 backdrop-blur-lg border border-stone-700/50 rounded-xl flex items-center justify-center hover:border-stone-600/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-stone-300" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-stone-50">Vista 360°</h2>
          <p className="text-stone-400">Análisis completo del contacto</p>
        </div>
      </div>

      {/* Contact Header Card */}
      <div className="bg-gradient-to-br from-stone-800/60 to-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-stone-50 mb-2">{contact.name}</h3>

              <div className="space-y-2">
                {contact.email && (
                  <div className="flex items-center gap-2 text-stone-300">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${contact.email}`} className="hover:text-emerald-400">
                      {contact.email}
                    </a>
                  </div>
                )}

                {contact.phone && (
                  <div className="flex items-center gap-2 text-stone-300">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${contact.phone}`} className="hover:text-emerald-400">
                      {contact.phone}
                    </a>
                  </div>
                )}

                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-stone-400" />
                    {contact.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {contact.tags.length > 3 && (
                      <span className="text-xs text-stone-400">
                        +{contact.tags.length - 3} más
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-stone-700/30 hover:bg-stone-700/50 border border-stone-600/30 rounded-lg text-sm text-stone-300 hover:text-stone-50 transition-all">
            <ExternalLink className="w-4 h-4" />
            Ver en GHL
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-stone-700/30 text-sm text-stone-400">
          <span>Cliente desde: {formatDate(contact.dateAdded)}</span>
          {contact.source && (
            <span className="ml-4">• Fuente: {contact.source}</span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} ${stat.borderColor} border backdrop-blur-lg rounded-xl p-4`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-stone-50 mb-1">{stat.value}</p>
              <p className="text-sm text-stone-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Deal Score Predictor */}
      <DealScorePredictor contactId={contactId} user={user} />

      {/* Activity Heatmap */}
      <ActivityHeatmap contactId={contactId} user={user} />

      {/* Timeline */}
      <ContactTimeline contactId={contactId} user={user} />

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-stone-400 mb-4">Resumen de Deals</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-stone-300 text-sm">Total Oportunidades</span>
              <span className="text-stone-50 font-bold">{stats.totalOpportunities}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-300 text-sm">Ganados</span>
              <span className="text-emerald-400 font-bold">{stats.wonDeals}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-300 text-sm">Perdidos</span>
              <span className="text-red-400 font-bold">{stats.lostDeals}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-300 text-sm">Activos</span>
              <span className="text-blue-400 font-bold">{stats.activeDeals}</span>
            </div>
          </div>
        </div>

        <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-stone-400 mb-4">Valor</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-stone-300 text-sm">Valor Total</span>
              <span className="text-stone-50 font-bold">{formatCurrency(stats.totalValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-300 text-sm">Lifetime Value</span>
              <span className="text-emerald-400 font-bold">{formatCurrency(stats.lifetimeValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-300 text-sm">Deal Promedio</span>
              <span className="text-blue-400 font-bold">{formatCurrency(stats.averageDealSize)}</span>
            </div>
          </div>
        </div>

        <div className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-stone-400 mb-4">Actividad</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-stone-300 text-sm">Total Interacciones</span>
              <span className="text-stone-50 font-bold">{stats.totalInteractions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-300 text-sm">Última Actividad</span>
              <span className="text-amber-400 font-bold">
                {stats.lastInteractionDays === 0 ? 'Hoy' : `${stats.lastInteractionDays} días`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-300 text-sm">Win Rate</span>
              <span className="text-emerald-400 font-bold">{stats.winRate.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
