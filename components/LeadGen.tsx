import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { AILead, Contact, AILeadAnalysis } from '../types';
import { Search, Globe, Loader2, UserPlus, ExternalLink, Building2, Mail, Phone, User, Cpu, Zap, Microscope, AlertTriangle, CheckCircle2, Target, X, Eye } from 'lucide-react';

interface LeadGenProps {
  onAddContact: (contact: Contact) => void;
}

const LeadGen: React.FC<LeadGenProps> = ({ onAddContact }) => {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [technology, setTechnology] = useState(''); 
  const [specificNeeds, setSpecificNeeds] = useState(''); 
  
  const [isSearching, setIsSearching] = useState(false);
  const [leads, setLeads] = useState<AILead[]>([]);
  const [error, setError] = useState('');

  // States for Modals
  const [viewLead, setViewLead] = useState<AILead | null>(null); // State for viewing lead details
  const [analyzingLeadUrl, setAnalyzingLeadUrl] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<{lead: AILead, data: AILeadAnalysis} | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry || !location) return;

    setIsSearching(true);
    setError('');
    setLeads([]);

    try {
      const results = await GeminiService.findLeads(industry, location, technology, specificNeeds);
      if (results.length === 0) {
        setError("No se encontraron resultados. Intenta ampliar la búsqueda.");
      } else {
        setLeads(results);
      }
    } catch (err) {
      setError("Error al conectar con el agente IA.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeepDive = async (lead: AILead, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAnalyzingLeadUrl(lead.website);
    try {
        const analysis = await GeminiService.analyzeCompanyDeepDive(lead.companyName, lead.website, specificNeeds);
        if (analysis) {
            setSelectedAnalysis({ lead, data: analysis });
            setViewLead(null); // Close detail modal if open
        } else {
            alert("No se pudo realizar el análisis profundo.");
        }
    } catch (e) {
        alert("Error en el análisis.");
    } finally {
        setAnalyzingLeadUrl(null);
    }
  };

  const handleImportLead = (lead: AILead, analysisData?: AILeadAnalysis, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const notesAnalysis = analysisData 
        ? `\n\n[ANÁLISIS IA]\nTipo: ${analysisData.companyType}\nNecesidades: ${analysisData.needs.join(', ')}\nVulnerabilidades: ${analysisData.weaknesses.join(', ')}` 
        : '';

    const newContact: Contact = {
      id: Date.now().toString(),
      name: (lead.contactName && lead.contactName !== 'N/A') ? lead.contactName : (lead.potentialRole || 'Contacto General'),
      company: lead.companyName,
      email: (lead.email && lead.email !== 'N/A') ? lead.email : '', 
      phone: (lead.phone && lead.phone !== 'N/A') ? lead.phone : '',
      role: lead.potentialRole || 'N/A',
      lastContact: new Date().toISOString().split('T')[0],
      notes: `Lead IA.\nWeb: ${lead.website}\nIntent: ${lead.intentSignal || 'N/A'}${notesAnalysis}`,
      technologies: lead.technologies,
      enrichmentStatus: 'enriched' 
    };

    onAddContact(newContact);
    if (selectedAnalysis) setSelectedAnalysis(null);
    if (viewLead) setViewLead(null);
    alert(`${newContact.name} importado correctamente a Contactos.`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <Globe className="text-primary" />
             Prospección Profunda
           </h1>
           <p className="text-gray-500 text-sm mt-1">
             Investigación de mercado avanzada. Filtra por necesidades específicas y detecta vulnerabilidades.
           </p>
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Industria</label>
            <input 
              type="text" 
              placeholder="Ej: SaaS, Clínica, Buffet..." 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
            />
          </div>
          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ubicación</label>
            <input 
              type="text" 
              placeholder="Ej: Madrid, CDMX..." 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Necesidad Específica</label>
            <input 
              type="text" 
              placeholder="Ej: Ciberseguridad, IA, Marketing..." 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary border-blue-200 bg-blue-50/30"
              value={specificNeeds}
              onChange={(e) => setSpecificNeeds(e.target.value)}
            />
          </div>
          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tecnología (Stack)</label>
            <input 
              type="text" 
              placeholder="Ej: WordPress, SAP..." 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={technology}
              onChange={(e) => setTechnology(e.target.value)}
            />
          </div>
          
          <div className="lg:col-span-4 mt-2">
              <button 
                type="submit" 
                disabled={isSearching}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-lg hover:to-blue-700 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition-transform"
              >
                {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                <span>Investigar Mercado</span>
              </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      
      {leads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead, idx) => (
            <div 
              key={idx} 
              onClick={() => setViewLead(lead)}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden group"
            >
              
              {/* Header with improved Intent Signal Badge */}
              <div className="flex justify-between items-start mb-3 gap-2">
                 <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-2 bg-blue-50 rounded-lg text-primary flex-shrink-0"><Building2 size={20} /></div>
                    <div className="min-w-0">
                        <div className="font-bold text-gray-900 truncate text-sm">{lead.companyName}</div>
                        <div className="text-[10px] text-gray-400 truncate">{lead.website}</div>
                    </div>
                 </div>
                 {lead.intentSignal && (
                   <div 
                    title={`Señal de intención: ${lead.intentSignal}`}
                    className="flex-shrink-0 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-1.5 rounded-lg border border-orange-200 flex items-center gap-1 shadow-sm max-w-[40%]"
                   >
                     <Zap size={12} className="flex-shrink-0 fill-orange-700"/> 
                     <span className="truncate">{lead.intentSignal}</span>
                   </div>
                 )}
              </div>

              {/* Description Truncated (Click to view more) */}
              <div className="relative mb-3 group-hover:bg-gray-50 rounded p-2 transition-colors">
                  <p className="text-xs text-gray-500 line-clamp-3 italic">"{lead.description}"</p>
                  <div className="absolute bottom-0 right-0 bg-gradient-to-l from-white to-transparent pl-4 text-[10px] text-blue-500 font-bold opacity-0 group-hover:opacity-100 flex items-center">
                    Ver más <Eye size={10} className="ml-1"/>
                  </div>
              </div>
              
              {/* Technographics */}
              {lead.technologies && lead.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {lead.technologies.slice(0, 3).map((tech, t) => (
                    <span key={t} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-0.5">
                      <Cpu size={10} /> {tech}
                    </span>
                  ))}
                  {lead.technologies.length > 3 && <span className="text-[10px] text-gray-400">+{lead.technologies.length - 3}</span>}
                </div>
              )}

              {/* Contact Data */}
              <div className="mt-auto space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs border border-gray-100">
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                          <User size={12} /> {lead.contactName || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={12} /> {lead.email || 'N/A'}
                      </div>
                  </div>

                  <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleDeepDive(lead, e)}
                        disabled={analyzingLeadUrl === lead.website}
                        className="flex-1 py-2 bg-purple-50 border border-purple-100 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        {analyzingLeadUrl === lead.website ? <Loader2 className="animate-spin" size={14} /> : <Microscope size={14} />}
                        {analyzingLeadUrl === lead.website ? 'Analizando...' : 'Analizar'}
                      </button>

                      <button 
                        onClick={(e) => handleImportLead(lead, undefined, e)}
                        className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-blue-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <UserPlus size={14} /> Agregar
                      </button>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEAD DETAILS MODAL (New) */}
      {viewLead && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{viewLead.companyName}</h2>
                  <a href={viewLead.website.startsWith('http') ? viewLead.website : `https://${viewLead.website}`} target="_blank" className="text-sm text-primary hover:underline flex items-center gap-1">
                    {viewLead.website} <ExternalLink size={12}/>
                  </a>
                </div>
              </div>
              <button onClick={() => setViewLead(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Intent Signal */}
              {viewLead.intentSignal && (
                 <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-3">
                    <Zap className="text-orange-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-bold text-orange-800 text-sm">Señal de Intención Detectada</h4>
                      <p className="text-sm text-orange-700">{viewLead.intentSignal}</p>
                    </div>
                 </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Sobre la Empresa</h3>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {viewLead.description}
                </p>
              </div>

              {/* Tech Stack */}
              {viewLead.technologies && viewLead.technologies.length > 0 && (
                 <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Stack Tecnológico</h3>
                    <div className="flex flex-wrap gap-2">
                        {viewLead.technologies.map((tech, i) => (
                           <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200 flex items-center gap-1">
                             <Cpu size={12}/> {tech}
                           </span>
                        ))}
                    </div>
                 </div>
              )}

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Datos de Contacto Encontrados</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 text-gray-400">
                            <User size={16}/>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">Nombre</div>
                            <div className="font-medium text-sm text-gray-800">{viewLead.contactName || 'No especificado'}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 text-gray-400">
                            <Mail size={16}/>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">Email</div>
                            <div className="font-medium text-sm text-gray-800">{viewLead.email || 'No especificado'}</div>
                        </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
                <button 
                  onClick={(e) => handleDeepDive(viewLead, e)}
                  disabled={analyzingLeadUrl === viewLead.website}
                  className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 flex justify-center items-center gap-2"
                >
                   {analyzingLeadUrl === viewLead.website ? <Loader2 className="animate-spin" size={18} /> : <Microscope size={18} />}
                   Analizar a Fondo
                </button>
                <button 
                  onClick={(e) => handleImportLead(viewLead, undefined, e)}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 flex justify-center items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                   <UserPlus size={18} />
                   Guardar en CRM
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Deep Dive Analysis Modal (Existing) */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex justify-between items-start shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-purple-300">
                            <Microscope size={20} />
                            <span className="font-bold tracking-wider text-xs uppercase">Reporte de Inteligencia</span>
                        </div>
                        <h2 className="text-2xl font-bold">{selectedAnalysis.lead.companyName}</h2>
                        <a href={selectedAnalysis.lead.website} target="_blank" className="text-sm text-gray-400 hover:text-white underline">{selectedAnalysis.lead.website}</a>
                    </div>
                    <button onClick={() => setSelectedAnalysis(null)} className="text-gray-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-8 overflow-y-auto bg-gray-50 flex-1 space-y-6">
                    
                    {/* Company Profile */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Building2 size={18} className="text-gray-400"/> Perfil Corporativo
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{selectedAnalysis.data.companyType}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Weaknesses / Vulnerabilities */}
                        <div className="bg-red-50 p-5 rounded-xl border border-red-100 shadow-sm">
                            <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                                <AlertTriangle size={18} /> Debilidades & Vulnerabilidades
                            </h3>
                            <ul className="space-y-2">
                                {selectedAnalysis.data.weaknesses.map((w, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-red-700 bg-white/60 p-2 rounded">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
                                        {w}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Needs */}
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
                            <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                                <Target size={18} /> Necesidades Detectadas
                            </h3>
                            <ul className="space-y-2">
                                {selectedAnalysis.data.needs.map((n, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-blue-700 bg-white/60 p-2 rounded">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                                        {n}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Sales Pitch */}
                    <div className="bg-gradient-to-r from-purple-50 to-white p-5 rounded-xl border border-purple-100 shadow-sm">
                         <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                            <Zap size={18} /> Estrategia de Entrada (Pitch)
                        </h3>
                        <p className="text-sm text-purple-900 italic font-medium">"{selectedAnalysis.data.salesPitch}"</p>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3 shrink-0">
                    <button 
                        onClick={() => setSelectedAnalysis(null)}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                    >
                        Cerrar
                    </button>
                    <button 
                        onClick={(e) => handleImportLead(selectedAnalysis.lead, selectedAnalysis.data, e)}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                        <UserPlus size={18} /> Importar Lead Inteligente
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default LeadGen;