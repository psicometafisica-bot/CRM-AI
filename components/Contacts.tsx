import React, { useState } from 'react';
import { Contact, Deal, Sequence, DealStage } from '../types';
import { Mail, Phone, Building, Sparkles, X, Plus, Pencil, Trash2, Linkedin, Zap, Send, User, MapPin, Calendar, Briefcase, FileText, Activity, Save } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

interface ContactsProps {
  contacts: Contact[];
  deals: Deal[];
  sequences?: Sequence[];
  onAddContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
}

const Contacts: React.FC<ContactsProps> = ({ contacts, deals, sequences = [], onAddContact, onEditContact, onDeleteContact }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null); // For Sequence Modal
  const [viewingContact, setViewingContact] = useState<Contact | null>(null); // For Detail View Modal
  
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);
  
  // Form fields
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');

  const handleEnrichContact = async (contact: Contact) => {
    setEnrichingId(contact.id);
    const enrichedData = await GeminiService.enrichContactData(contact);
    
    const updatedContact = {
      ...contact,
      ...enrichedData,
      enrichmentStatus: 'enriched' as const
    };
    onEditContact(updatedContact);
    setEnrichingId(null);
  };

  const handleAddToSequence = (sequenceId: string) => {
    if (selectedContact) {
      onEditContact({ ...selectedContact, activeSequenceId: sequenceId });
      setIsSequenceModalOpen(false);
      alert(`${selectedContact.name} agregado a la secuencia.`);
    }
  };

  const handleSaveNotes = () => {
    if (viewingContact) {
        onEditContact(viewingContact);
    }
  };

  // Add/Edit Modal helpers
  const openAddModal = () => {
    setEditingContactId(null);
    setNewName(''); setNewEmail(''); setNewPhone(''); setNewCompany(''); setNewRole('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContactId(contact.id);
    setNewName(contact.name); setNewEmail(contact.email); setNewPhone(contact.phone); setNewCompany(contact.company); setNewRole(contact.role);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contactData: Contact = {
        id: editingContactId || Date.now().toString(),
        name: newName, email: newEmail, phone: newPhone, company: newCompany, role: newRole,
        lastContact: editingContactId ? contacts.find(c => c.id === editingContactId)?.lastContact || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: editingContactId ? contacts.find(c => c.id === editingContactId)?.notes || '' : '',
        enrichmentStatus: 'pending'
    };
    editingContactId ? onEditContact(contactData) : onAddContact(contactData);
    setIsAddModalOpen(false);
  };

  // Helper to get deals for the viewing contact
  const getContactDeals = (contactId: string) => {
    return deals.filter(d => d.contactId === contactId);
  };

  const getStageColor = (stage: DealStage) => {
      switch(stage) {
          case DealStage.CERRADO_GANADO: return 'bg-green-100 text-green-700 border-green-200';
          case DealStage.CERRADO_PERDIDO: return 'bg-red-100 text-red-700 border-red-200';
          case DealStage.NEGOCIACION: return 'bg-purple-100 text-purple-700 border-purple-200';
          default: return 'bg-blue-100 text-blue-700 border-blue-200';
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Base de Contactos</h1>
        <button onClick={openAddModal} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm">
          <Plus size={16} /> Nuevo Contacto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                <th className="p-4">Persona</th>
                <th className="p-4">Empresa & Tech</th>
                <th className="p-4">Datos</th>
                <th className="p-4 text-right">Herramientas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 align-top cursor-pointer" onClick={() => setViewingContact(contact)}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                            {contact.name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{contact.name}</div>
                            <div className="text-sm text-gray-500">{contact.role}</div>
                            {contact.activeSequenceId && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase border border-blue-100">
                                <Send size={8} /> En Secuencia
                            </span>
                            )}
                        </div>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="text-gray-900 font-medium">{contact.company}</div>
                    <div className="text-xs text-gray-500 mb-1">{contact.location || ''}</div>
                    {contact.technologies && (
                      <div className="flex flex-wrap gap-1">
                        {contact.technologies.slice(0, 3).map(t => (
                          <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{t}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-4 align-top space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail size={14} className={contact.email ? "text-gray-400" : "text-red-300"} /> 
                      <span>{contact.email || "---"}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Linkedin size={14} className={contact.linkedIn ? "text-blue-500" : "text-gray-300"} /> 
                      {contact.linkedIn ? <a href={contact.linkedIn.startsWith('http') ? contact.linkedIn : `https://${contact.linkedIn}`} target="_blank" className="text-blue-600 hover:underline text-xs">Perfil LinkedIn</a> : <span className="text-xs text-gray-400">No disponible</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right align-top">
                    <div className="flex items-center justify-end gap-2">
                        {/* Enrich Button */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEnrichContact(contact); }}
                          disabled={contact.enrichmentStatus === 'enriched' || enrichingId === contact.id}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                             contact.enrichmentStatus === 'enriched' 
                             ? 'bg-green-50 text-green-700 border-green-200'
                             : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          {enrichingId === contact.id ? <div className="animate-spin w-3 h-3 border-2 border-amber-600 rounded-full border-t-transparent"/> : <Zap size={12} fill={contact.enrichmentStatus === 'enriched' ? "currentColor" : "none"} />}
                          {contact.enrichmentStatus === 'enriched' ? 'Enriquecido' : 'Enriquecer'}
                        </button>

                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedContact(contact); setIsSequenceModalOpen(true); }}
                          title="Añadir a Secuencia"
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
                        >
                          <Send size={14} />
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); openEditModal(contact); }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                          <Pencil size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteContact(contact.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CONTACT DETAIL & TRACKING MODAL --- */}
      {viewingContact && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
             <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                 {/* Header */}
                 <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-start">
                     <div className="flex gap-4 items-center">
                         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                             {viewingContact.name.charAt(0)}
                         </div>
                         <div>
                             <h2 className="text-2xl font-bold text-gray-800">{viewingContact.name}</h2>
                             <div className="flex items-center gap-2 text-gray-500">
                                 <Briefcase size={16} />
                                 <span className="font-medium">{viewingContact.role}</span>
                                 <span className="text-gray-300">|</span>
                                 <Building size={16} />
                                 <span className="font-medium">{viewingContact.company}</span>
                             </div>
                             <div className="flex gap-2 mt-2">
                                 {viewingContact.enrichmentStatus === 'enriched' && (
                                     <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold border border-green-200 flex items-center gap-1">
                                         <Zap size={10} fill="currentColor"/> Datos Verificados
                                     </span>
                                 )}
                             </div>
                         </div>
                     </div>
                     <button onClick={() => setViewingContact(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                         <X size={24} />
                     </button>
                 </div>

                 <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                     {/* Sidebar: Contact Info */}
                     <div className="w-full md:w-1/3 bg-white p-6 border-r border-gray-100 overflow-y-auto">
                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Información de Contacto</h3>
                         
                         <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                     <Mail size={16} />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="text-xs text-gray-400">Email Profesional</div>
                                     <div className="font-medium text-sm truncate" title={viewingContact.email}>{viewingContact.email || 'No disponible'}</div>
                                 </div>
                             </div>

                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                     <Phone size={16} />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="text-xs text-gray-400">Teléfono</div>
                                     <div className="font-medium text-sm">{viewingContact.phone || 'No disponible'}</div>
                                 </div>
                             </div>

                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                     <MapPin size={16} />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="text-xs text-gray-400">Ubicación</div>
                                     <div className="font-medium text-sm">{viewingContact.location || 'No especificada'}</div>
                                 </div>
                             </div>

                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-blue-500">
                                     <Linkedin size={16} />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="text-xs text-gray-400">Red Social</div>
                                     {viewingContact.linkedIn ? (
                                         <a href={viewingContact.linkedIn.startsWith('http') ? viewingContact.linkedIn : `https://${viewingContact.linkedIn}`} target="_blank" className="text-sm text-blue-600 hover:underline font-medium">Ver Perfil</a>
                                     ) : (
                                         <span className="text-sm text-gray-400">No vinculado</span>
                                     )}
                                 </div>
                             </div>
                         </div>

                         <div className="mt-8">
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Stack Tecnológico</h3>
                             <div className="flex flex-wrap gap-2">
                                 {viewingContact.technologies && viewingContact.technologies.length > 0 ? (
                                     viewingContact.technologies.map(t => (
                                         <span key={t} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-100">
                                             {t}
                                         </span>
                                     ))
                                 ) : (
                                     <span className="text-sm text-gray-400 italic">No hay datos tecnológicos.</span>
                                 )}
                             </div>
                         </div>

                         <div className="mt-8">
                             <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notas Internas</h3>
                                <button 
                                    onClick={handleSaveNotes}
                                    className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 font-bold transition-colors flex items-center gap-1"
                                    title="Guardar Notas"
                                >
                                    <Save size={10} /> Guardar
                                </button>
                             </div>
                             <textarea 
                                className="w-full bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-gray-700 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none resize-none min-h-[120px] placeholder-yellow-700/50"
                                value={viewingContact.notes || ''}
                                onChange={(e) => setViewingContact({...viewingContact, notes: e.target.value})}
                                placeholder="Escribe notas internas, recordatorios o detalles importantes aquí..."
                             />
                         </div>
                     </div>

                     {/* Main Content: Tracking Sheet / Activity */}
                     <div className="w-full md:w-2/3 bg-gray-50/50 p-6 overflow-y-auto">
                         <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                             <Activity className="text-primary" /> Planilla de Seguimiento (Embudo)
                         </h3>
                         
                         {getContactDeals(viewingContact.id).length === 0 ? (
                             <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                                 <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                                 <p className="text-gray-500 font-medium">No hay oportunidades registradas para este contacto.</p>
                                 <p className="text-sm text-gray-400">Crea un "Nuevo Deal" en el Embudo para iniciar el seguimiento.</p>
                             </div>
                         ) : (
                             <div className="space-y-6 relative before:absolute before:left-[27px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-200">
                                 {getContactDeals(viewingContact.id).map((deal, idx) => (
                                     <div key={deal.id} className="relative pl-16">
                                         {/* Timeline Node */}
                                         <div className={`absolute left-0 top-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 bg-white z-10 shadow-sm
                                            ${deal.stage === DealStage.CERRADO_GANADO ? 'border-green-200 text-green-600' : 'border-blue-100 text-blue-600'}
                                         `}>
                                             <span className="text-[10px] font-bold uppercase">{new Date(deal.expectedCloseDate).toLocaleString('default', { month: 'short' })}</span>
                                             <span className="text-lg font-bold leading-none">{new Date(deal.expectedCloseDate).getDate()}</span>
                                         </div>

                                         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                                             <div className="p-4 border-b border-gray-50 flex justify-between items-start bg-gray-50/30">
                                                 <div>
                                                     <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1 border ${getStageColor(deal.stage)}`}>
                                                         {deal.stage.replace('_', ' ')}
                                                     </div>
                                                     <h4 className="font-bold text-gray-800 text-lg">{deal.title}</h4>
                                                 </div>
                                                 <div className="text-right">
                                                     <div className="font-mono font-bold text-gray-900 text-lg">${deal.amount.toLocaleString()}</div>
                                                     <div className="text-xs text-gray-500">Probabilidad: {deal.probability}%</div>
                                                 </div>
                                             </div>
                                             
                                             <div className="p-4 space-y-3">
                                                 <div>
                                                     <h5 className="text-xs font-bold text-gray-400 uppercase mb-1">Observaciones / Bitácora</h5>
                                                     <p className="text-sm text-gray-700 leading-relaxed">
                                                         {deal.observations || <span className="italic text-gray-400">Sin observaciones registradas.</span>}
                                                     </p>
                                                 </div>
                                                 
                                                 {deal.aiAnalysis && (
                                                     <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 mt-2">
                                                         <div className="flex items-center gap-1 text-xs font-bold text-purple-700 mb-1">
                                                             <Sparkles size={12} /> Análisis IA
                                                         </div>
                                                         <p className="text-xs text-purple-800 line-clamp-2">{deal.aiAnalysis}</p>
                                                     </div>
                                                 )}
                                             </div>
                                             
                                             <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between">
                                                <span>ID: {deal.id}</span>
                                                <span>Cierre estimado: {deal.expectedCloseDate}</span>
                                             </div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>
                 </div>
             </div>
         </div>
      )}

      {/* Add/Edit Modal (Existing) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <h3 className="font-bold text-lg mb-4">{editingContactId ? 'Editar' : 'Nuevo'} Contacto</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
                <input required placeholder="Nombre" className="w-full px-3 py-2 border rounded" value={newName} onChange={e => setNewName(e.target.value)} />
                <input required placeholder="Email" className="w-full px-3 py-2 border rounded" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                <input placeholder="Empresa" className="w-full px-3 py-2 border rounded" value={newCompany} onChange={e => setNewCompany(e.target.value)} />
                <input placeholder="Rol" className="w-full px-3 py-2 border rounded" value={newRole} onChange={e => setNewRole(e.target.value)} />
                <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded">Cancelar</button>
                    <button type="submit" className="flex-1 py-2 bg-primary text-white rounded">Guardar</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Add to Sequence Modal (Existing) */}
      {isSequenceModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800">Añadir a Secuencia</h3>
                <button onClick={() => setIsSequenceModalOpen(false)}><X size={18} className="text-gray-400"/></button>
            </div>
            <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">Selecciona una secuencia activa para <b>{selectedContact?.name}</b>:</p>
                <div className="space-y-2">
                    {sequences.map(seq => (
                        <button 
                            key={seq.id}
                            onClick={() => handleAddToSequence(seq.id)}
                            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex justify-between group"
                        >
                            <div>
                                <div className="font-bold text-gray-800 text-sm">{seq.name}</div>
                                <div className="text-xs text-gray-500">{seq.steps.length} pasos • {seq.targetAudience}</div>
                            </div>
                            <Send size={16} className="text-gray-300 group-hover:text-blue-500" />
                        </button>
                    ))}
                    {sequences.length === 0 && <p className="text-center text-sm text-gray-400 italic">No hay secuencias creadas.</p>}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;