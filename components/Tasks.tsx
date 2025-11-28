import React, { useState } from 'react';
import { Task } from '../types';
import { CheckSquare, Square, Plus, Calendar as CalendarIcon, User, Filter, X, Trash2, Pencil, AlignLeft } from 'lucide-react';

interface TasksProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, onAddTask, onEditTask, onToggleTask, onDeleteTask }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskAssignee, setNewTaskAssignee] = useState('user1');
  const [newTaskObservations, setNewTaskObservations] = useState('');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const openAddModal = () => {
      setEditingTaskId(null);
      setNewTaskTitle('');
      setNewTaskDate(new Date().toISOString().split('T')[0]);
      setNewTaskAssignee('user1');
      setNewTaskObservations('');
      setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
      setEditingTaskId(task.id);
      setNewTaskTitle(task.title);
      setNewTaskDate(task.dueDate);
      setNewTaskAssignee(task.assignedTo);
      setNewTaskObservations(task.observations || '');
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (editingTaskId) {
        const originalTask = tasks.find(t => t.id === editingTaskId);
        if (originalTask) {
            const updatedTask: Task = {
                ...originalTask,
                title: newTaskTitle,
                dueDate: newTaskDate,
                assignedTo: newTaskAssignee,
                observations: newTaskObservations
            };
            onEditTask(updatedTask);
        }
    } else {
        const task: Task = {
          id: Date.now().toString(),
          title: newTaskTitle,
          dueDate: newTaskDate,
          completed: false,
          assignedTo: newTaskAssignee,
          observations: newTaskObservations
        };
        onAddTask(task);
    }
    
    setNewTaskTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Mis Tareas</h1>
        <button 
          onClick={openAddModal}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Nueva Tarea
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 border-b border-gray-200 pb-1">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'pending', label: 'Pendientes' },
          { id: 'completed', label: 'Completadas' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${
              filter === f.id 
                ? 'text-primary bg-blue-50 border-b-2 border-primary' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CheckSquare size={48} className="mx-auto mb-4 opacity-20" />
            <p>No hay tareas en esta vista.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTasks.map(task => (
              <div key={task.id} className="p-4 flex items-start group hover:bg-gray-50 transition-colors">
                <button 
                  onClick={() => onToggleTask(task.id)}
                  className={`mr-4 mt-1 flex-shrink-0 transition-colors ${task.completed ? 'text-green-500' : 'text-gray-300 hover:text-primary'}`}
                >
                  {task.completed ? <CheckSquare size={24} /> : <Square size={24} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  
                  {task.observations && (
                      <div className="flex gap-1.5 mt-1 items-start text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 max-w-2xl">
                          <AlignLeft size={12} className="shrink-0 mt-0.5 text-gray-400"/>
                          <p className="line-clamp-2">{task.observations}</p>
                      </div>
                  )}

                  <div className="flex items-center gap-4 mt-2">
                    <div className={`flex items-center text-xs ${new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                      <CalendarIcon size={12} className="mr-1" />
                      {task.dueDate}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <User size={12} className="mr-1" />
                      {task.assignedTo === 'user1' ? 'Yo' : task.assignedTo}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(task)}
                      className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">{editingTaskId ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Título</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ej: Enviar presupuesto a cliente..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Observaciones</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-20"
                  placeholder="Detalles adicionales, notas o contexto..."
                  value={newTaskObservations}
                  onChange={e => setNewTaskObservations(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Vencimiento</label>
                   <input 
                     type="date" 
                     required
                     className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                     value={newTaskDate}
                     onChange={e => setNewTaskDate(e.target.value)}
                   />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Asignado a</label>
                   <select 
                     className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                     value={newTaskAssignee}
                     onChange={e => setNewTaskAssignee(e.target.value)}
                   >
                     <option value="user1">Mí (Admin)</option>
                     <option value="user2">Ventas 1</option>
                   </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                 <button 
                   type="button" 
                   onClick={() => setIsModalOpen(false)}
                   className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                 >
                   Cancelar
                 </button>
                 <button 
                   type="submit" 
                   className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm"
                 >
                   {editingTaskId ? 'Guardar Cambios' : 'Crear Tarea'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;