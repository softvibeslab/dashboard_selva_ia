import { useState } from 'react';
import { Search, Users, Mail, Phone, Tag, Eye } from 'lucide-react';
import { User } from '../lib/supabase';
import { Contact, searchContacts } from '../lib/contact-service';
import { ContactDetailView } from './ContactDetailView';

interface ContactsViewProps {
  user: User;
}

export function ContactsView({ user }: ContactsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    const results = await searchContacts(searchQuery, user);
    setContacts(results);
    setSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Si hay un contacto seleccionado, mostrar vista 360°
  if (selectedContactId) {
    return (
      <ContactDetailView
        contactId={selectedContactId}
        user={user}
        onBack={() => setSelectedContactId(null)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-stone-50 mb-2">Contactos</h2>
        <p className="text-stone-400">Busca y gestiona tus contactos</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Buscar por nombre o email..."
              className="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl pl-12 pr-4 py-3 text-stone-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Users className="w-16 h-16 text-stone-600 mx-auto mb-4" />
              <p className="text-stone-400 mb-2">
                {searchQuery
                  ? 'No se encontraron contactos'
                  : 'Busca un contacto para ver su vista 360°'}
              </p>
              <p className="text-sm text-stone-500">
                Ingresa un nombre o email y presiona Enter
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-stone-800/40 backdrop-blur-lg border border-stone-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all group cursor-pointer"
                onClick={() => setSelectedContactId(contact.id)}
              >
                {/* Avatar & Name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-stone-50 truncate group-hover:text-emerald-400 transition-colors">
                      {contact.name}
                    </h3>
                    {contact.email && (
                      <div className="flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3 text-stone-400 flex-shrink-0" />
                        <p className="text-xs text-stone-400 truncate">{contact.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone */}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-xs text-stone-300 mb-2">
                    <Phone className="w-3 h-3 text-stone-400" />
                    <span>{contact.phone}</span>
                  </div>
                )}

                {/* Tags */}
                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Tag className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    {contact.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {contact.tags.length > 2 && (
                      <span className="text-[10px] text-stone-400">
                        +{contact.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* View Button */}
                <button
                  onClick={() => setSelectedContactId(contact.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-semibold text-emerald-400 transition-all group-hover:bg-emerald-500/20"
                >
                  <Eye className="w-3 h-3" />
                  Ver Vista 360°
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      {contacts.length > 0 && (
        <div className="mt-4 text-sm text-stone-400 text-center">
          Se encontraron {contacts.length} contacto{contacts.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
