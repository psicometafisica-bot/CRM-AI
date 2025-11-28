import React, { useState } from 'react';
import { Deal, DealStage, Contact } from '../types';
import { MoreHorizontal, AlertCircle, TrendingUp, Sparkles, X, Plus, Pencil, Trash2, BrainCircuit, Target, Lightbulb, StickyNote } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

interface PipelineProps {
  deals: Deal[];
  contacts: Contact[];
  onUpdateDeal: (updatedDeal: Deal) => void;
  onAddDeal: (deal: Deal) => void;
  onDeleteDeal: (id: string) => void;
}

const Pipeline: React.FC<PipelineProps> = ({ deals, contacts, onUpdateDeal, onAddDeal, onDeleteDeal }) => {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  
  // Strategy Modal State
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [strategyContent, setStrategyContent] = useState('');
  const [strategyDealTitle, setStrategyDealTitle] = useState('');
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  // Add/Edit Deal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newContactId, setNewContactId] = useState('');
  const [newCloseDate, setNewCloseDate] = useState('');
  const [newStage, setNewStage] = useState<DealStage>(DealStage.LEAD);
  const [newObservations, setNewObservations] = useState('');

  const columns = Object.values(DealStage);

  const getContact = (id: string) => contacts.find(c => c.id === id);

  // --- AI ACTIONS ---

  const handleAIAnalyze = async (deal: Deal) => {
    const contact = getContact(deal.contactId);
    if (!contact) return;

    setAnalyzingId(deal.id);
    const result = await GeminiService.analyzeDeal(deal, contact);
    
    const updatedDeal: Deal = {
      ...deal,
      probability: result.predictedProbability,
      aiAnalysis: `**Análisis:** ${result.analysis}\n\n**Acción Recomendada:** ${result.recommendedAction}`
    };

    onUpdateDeal(updatedDeal);
    setAnalyzingId(null);
  };

  const handleGenerateStrategy = async (deal: Deal) => {
    const contact = getContact(deal.contactId);
    if (!contact) return;

    setStrategyDealTitle(deal.title);
    setStrategyContent('');
    setStrategyModalOpen(true);
    setIsGeneratingStrategy(true);

    const strategy = await GeminiService.generateSalesStrategy(deal, contact);
    setStrategyContent(strategy);
    setIsGeneratingStrategy(false);
  };

  // --- CRUD ACTIONS ---

  const handleStageChange = (deal: Deal, newStage: string) => {
    onUpdateDeal({ ...deal, stage: newStage as DealStage });
  };

  const openAddModal = () => {
    setEditingDealId(null);
    setNewTitle('');
    setNewAmount(0);
    setNewContactId('');
    setNewCloseDate(new Date().toISOString().split('T')[0]);
    setNewStage(DealStage.LEAD);
    setNewObservations('');
    setIsModalOpen(true);
  };

  const openEditModal = (deal: Deal) => {
    setEditingDealId(deal.id);
    setNewTitle(deal.title);
    setNewAmount(deal.amount);
    setNewContactId(deal.contactId);
    setNewCloseDate(deal.expectedCloseDate);
    setNewStage(deal.stage);
    setNewObservations(deal.observations || '');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta oportunidad? Se perderá el historial de análisis.')) {
      onDeleteDeal(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newContactId) {
          alert("Por favor selecciona un contacto");
          return;
      }

      if (editingDealId) {
        // Edit Mode
        const dealToUpdate = deals.find(d => d.id === editingDealId);
        if (dealToUpdate) {
            onUpdateDeal({
                ...dealToUpdate,
                title: newTitle,
                amount: Number(newAmount),
                contactId: newContactId,
                expectedCloseDate: newCloseDate,
                stage: newStage,
                observations: newObservations
            });
        }
      } else {
        // Create Mode
        const newDeal: Deal = {
            id: Date.now().toString(),
            title: newTitle,
            amount: Number(newAmount),
            stage: newStage,
            contactId: newContactId,
            probability: 20, // Default probability
            expectedCloseDate: newCloseDate,
            observations: newObservations
        };
        onAddDeal(newDeal);
      }

      setIsModalOpen(false);
      setEditingDealId(null);
      setNewTitle(''); setNewAmount(0); setNewContactId(''); setNewCloseDate(''); setNewObservations('');
  };

  return (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Embudo de Ventas</h1>
            <p className="text-gray-500 text-sm">Gestiona tus oportunidades y utiliza la IA para acelerar el cierre.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Nuevo Deal
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        {/* Usamos inline-flex para asegurar que el contenedor crezca horizontalmente */}
        <div className="inline-flex space-x-4 h-full min-w-full">
          {columns.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage);
            const totalAmount = stageDeals.reduce((sum, d) => sum + d.amount, 0);
            
            return (
              <div key={stage} className="w-72 flex-shrink-0 flex flex-col bg-gray-50 rounded-xl border border-gray-200 h-full">
                {/* Column Header */}
                <div className="p-3 border-b border-gray-200 bg-white rounded-t-xl sticky top-0 z-10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                      {stage.replace('_', ' ')}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${stage === 'CERRADO_GANADO' ? 'bg-green-500' : 'bg-primary'} w-full opacity-50`}></div>
                  </div>
                  <div className="text-right mt-1 text-xs font-semibold text-gray-500">
                    Total: ${totalAmount.toLocaleString()}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                  {stageDeals.map(deal => {
                    const contact = getContact(deal.contactId);
                    const isAnalyzing = analyzingId === deal.id;

                    return (
                      <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 group hover:shadow-md transition-all relative">
                        {/* Top Actions (Edit/Delete) */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button onClick={() => openEditModal(deal)} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded">
                                <Pencil size={12} />
                            </button>
                            <button onClick={() => handleDeleteClick(deal.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                                <Trash2 size={12} />
                            </button>
                        </div>

                        <div className="flex justify-between items-start mb-2 pr-12">
                          <h4 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight">{deal.title}</h4>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                            <Target size={10} />
                            <span className="font-medium truncate max-w-[160px]">{contact?.company || 'Sin Empresa'}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-500 mb-3 bg-gray-50 p-1.5 rounded">
                          <span className="font-mono font-bold text-gray-900">
                            ${deal.amount.toLocaleString()}
                          </span>
                          <span>{deal.expectedCloseDate}</span>
                        </div>
                        
                        {/* Observations Field */}
                        {deal.observations && (
                          <div className="mb-3 p-2 bg-yellow-50 rounded border border-yellow-100 text-xs text-gray-700 shadow-sm flex gap-2 items-start">
                             <StickyNote size={12} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                             <p className="line-clamp-3 leading-tight italic">{deal.observations}</p>
                          </div>
                        )}

                        {/* AI Analysis Box */}
                        {deal.aiAnalysis && (
                           <div className="mb-3 p-2 bg-gradient-to-r from-purple-50 to-white rounded border border-purple-100 text-xs text-purple-900 shadow-sm">
                             <div className="flex items-center gap-1 font-bold mb-1 text-purple-700">
                               <Sparkles size={10} /> Nexus Insight
                             </div>
                             <p className="line-clamp-3 leading-relaxed opacity-90">{deal.aiAnalysis.replace(/\*\*/g, '')}</p>
                           </div>
                        )}

                        {/* Bottom Actions */}
                        <div className="pt-2 border-t border-gray-50 flex flex-col gap-2">
                          
                          {/* Stage Mover */}
                          <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-1" title="Probabilidad de Cierre">
                                <div className={`w-2 h-2 rounded-full ${deal.probability > 70 ? 'bg-green-500' : deal.probability > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs font-bold text-gray-600">{deal.probability}%</span>
                              </div>
                              <select 
                                  className="text-[10px] font-medium uppercase border border-gray-200 rounded px-1 py-0.5 bg-gray-50 text-gray-600 outline-none focus:border-primary max-w-[100px]"
                                  value={deal.stage}
                                  onChange={(e) => handleStageChange(deal, e.target.value)}
                              >
                                  {columns.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                              </select>
                          </div>

                          {/* AI Buttons */}
                          <div className="flex gap-2 mt-1">
                            <button 
                              onClick={() => handleAIAnalyze(deal)}
                              disabled={isAnalyzing}
                              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-medium border transition-colors ${
                                isAnalyzing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-primary hover:border-primary'
                              }`}
                            >
                              {isAnalyzing ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/> : <Sparkles size={12} />}
                              Analizar
                            </button>
                            <button 
                                onClick={() => handleGenerateStrategy(deal)}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-medium text-white bg-gray-900 hover:bg-black transition-colors shadow-sm"
                            >
                                <Lightbulb size={12} className="text-yellow-300" />
                                Estrategia
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Deal Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">{editingDealId ? 'Editar Oportunidad' : 'Nueva Oportunidad'}</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Título</label>
                          <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary" placeholder="Ej: Licencia Anual" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Valor ($)</label>
                            <input required type="number" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary" value={newAmount} onChange={e => setNewAmount(Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Etapa Inicial</label>
                            <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary" value={newStage} onChange={e => setNewStage(e.target.value as DealStage)}>
                                {columns.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cliente</label>
                          <select required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary" value={newContactId} onChange={e => setNewContactId(e.target.value)}>
                              <option value="">Seleccionar Cliente...</option>
                              {contacts.map(c => (
                                  <option key={c.id} value={c.id}>{c.name} - {c.company}</option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cierre Esperado</label>
                          <input required type="date" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary" value={newCloseDate} onChange={e => setNewCloseDate(e.target.value)} />
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Observaciones</label>
                          <textarea 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary h-24 resize-none" 
                            placeholder="Notas internas sobre el cliente o el progreso..."
                            value={newObservations} 
                            onChange={e => setNewObservations(e.target.value)} 
                          />
                      </div>
                      <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                            {editingDealId ? 'Guardar Cambios' : 'Crear Deal'}
                        </button>
                    </div>
                  </form>
              </div>
          </div>
      )}

      {/* AI Strategy Modal */}
      {strategyModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-yellow-300">
                            <BrainCircuit size={20} />
                            <span className="font-bold tracking-wider text-xs uppercase">Nexus AI Strategy</span>
                        </div>
                        <h2 className="text-xl font-bold">Hoja de Ruta: {strategyDealTitle}</h2>
                    </div>
                    <button onClick={() => setStrategyModalOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-8 overflow-y-auto bg-gray-50 flex-1">
                    {isGeneratingStrategy ? (
                        <div className="flex flex-col items-center justify-center h-48 space-y-4">
                            <div className="relative w-16 h-16">
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-gray-500 font-medium animate-pulse">Analizando variables y generando tácticas...</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                                    {strategyContent}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-white flex justify-end">
                    <button 
                        onClick={() => setStrategyModalOpen(false)}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Pipeline;