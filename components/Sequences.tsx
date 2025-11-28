import React, { useState } from 'react';
import { Sequence, SequenceStep } from '../types';
import { Send, Plus, Clock, MoreHorizontal, MessageSquare, Phone, Linkedin, BrainCircuit, X, Play } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

interface SequencesProps {
  sequences: Sequence[];
  onAddSequence: (seq: Sequence) => void;
}

const Sequences: React.FC<SequencesProps> = ({ sequences, onAddSequence }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Wizard State
  const [name, setName] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [generatedSteps, setGeneratedSteps] = useState<SequenceStep[]>([]);

  const handleGenerate = async () => {
    if (!audience || !goal) return;
    setIsGenerating(true);
    const steps = await GeminiService.generateSequence(audience, goal);
    setGeneratedSteps(steps);
    setIsGenerating(false);
  };

  const handleSave = () => {
    if (!name || generatedSteps.length === 0) return;
    const newSeq: Sequence = {
        id: Date.now().toString(),
        name,
        targetAudience: audience,
        steps: generatedSteps,
        enrolledCount: 0
    };
    onAddSequence(newSeq);
    setIsModalOpen(false);
    // Reset
    setName(''); setAudience(''); setGoal(''); setGeneratedSteps([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Secuencias de Ventas</h1>
            <p className="text-gray-500 text-sm">Automatiza tu outreach multicanal (Email, Call, LinkedIn).</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Nueva Secuencia
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sequences.map(seq => (
            <div key={seq.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">{seq.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">Target: {seq.targetAudience}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-gray-700">{seq.enrolledCount} Activos</span>
                    </div>
                </div>
                <div className="p-5">
                    <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                        {seq.steps.map((step, idx) => (
                            <div key={idx} className="relative flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-white
                                    ${step.type === 'email' ? 'border-blue-100 text-blue-600' : step.type === 'linkedin' ? 'border-indigo-100 text-indigo-600' : 'border-green-100 text-green-600'}
                                `}>
                                    {step.type === 'email' && <MessageSquare size={18} />}
                                    {step.type === 'linkedin' && <Linkedin size={18} />}
                                    {step.type === 'call' && <Phone size={18} />}
                                </div>
                                <div className="flex-1 pt-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Día {step.day}</span>
                                        <span className="text-[10px] font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600 uppercase">{step.type}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-800">
                                        {step.subject || step.content.substring(0, 40) + '...'}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{step.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <BrainCircuit className="text-primary" /> Constructor de Secuencias IA
                    </h2>
                    <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400"/></button>
                </div>
                
                <div className="p-8 overflow-y-auto flex-1">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la Campaña</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Ej: Outbound CEO SaaS" value={name} onChange={e => setName(e.target.value)}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Audiencia Objetivo</label>
                                <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Ej: Gerentes de Marketing" value={audience} onChange={e => setAudience(e.target.value)}/>
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Objetivo de Venta</label>
                                <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Ej: Agendar una Demo" value={goal} onChange={e => setGoal(e.target.value)}/>
                             </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !audience}
                            className="w-full py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-medium shadow-lg hover:scale-[1.01] transition-transform flex justify-center items-center gap-2"
                        >
                            {isGenerating ? <div className="animate-spin w-5 h-5 border-2 border-white rounded-full border-t-transparent"/> : <SparklesIcon />}
                            Generar Pasos con IA
                        </button>

                        {/* Preview Generated Steps */}
                        {generatedSteps.length > 0 && (
                            <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-xs text-gray-500 uppercase">Vista Previa</div>
                                <div className="divide-y divide-gray-100">
                                    {generatedSteps.map((step, i) => (
                                        <div key={i} className="p-4 hover:bg-gray-50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">Día {step.day}</span>
                                                <span className="uppercase text-xs font-bold text-gray-400">{step.type}</span>
                                            </div>
                                            {step.subject && <div className="text-sm font-bold text-gray-800 mb-1">Asunto: {step.subject}</div>}
                                            <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100">{step.content}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 font-medium">Cancelar</button>
                    <button onClick={handleSave} disabled={generatedSteps.length === 0} className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                        Guardar Secuencia
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>
);

export default Sequences;