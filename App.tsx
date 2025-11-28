import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Contacts from './components/Contacts';
import Pipeline from './components/Pipeline';
import Calendar from './components/Calendar';
import Tasks from './components/Tasks';
import LeadGen from './components/LeadGen';
import Sequences from './components/Sequences';
import AIChat from './components/AIChat';
import { store } from './services/store';
import { Contact, Deal, Task, Appointment, Sequence } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);

  // Load initial data
  useEffect(() => {
    setContacts(store.getContacts());
    setDeals(store.getDeals());
    setTasks(store.getTasks());
    setAppointments(store.getAppointments());
    setSequences(store.getSequences());
  }, []);

  // Handlers to update state and persist to store
  const handleUpdateDeal = (updatedDeal: Deal) => {
    const newDeals = deals.map(d => d.id === updatedDeal.id ? updatedDeal : d);
    setDeals(newDeals);
    store.saveDeals(newDeals);
  };

  const handleAddDeal = (deal: Deal) => {
    const newDeals = [...deals, deal];
    setDeals(newDeals);
    store.saveDeals(newDeals);
  };
  
  const handleDeleteDeal = (id: string) => {
    const newDeals = deals.filter(d => d.id !== id);
    setDeals(newDeals);
    store.saveDeals(newDeals);
  };

  const handleAddContact = (contact: Contact) => {
    const newContacts = [...contacts, contact];
    setContacts(newContacts);
    store.saveContacts(newContacts);
  };

  const handleEditContact = (updatedContact: Contact) => {
    const newContacts = contacts.map(c => c.id === updatedContact.id ? updatedContact : c);
    setContacts(newContacts);
    store.saveContacts(newContacts);
  };

  const handleDeleteContact = (id: string) => {
    const newContacts = contacts.filter(c => c.id !== id);
    setContacts(newContacts);
    store.saveContacts(newContacts);
  };

  const handleAddTask = (task: Task) => {
    const newTasks = [...tasks, task];
    setTasks(newTasks);
    store.saveTasks(newTasks);
  };

  const handleEditTask = (updatedTask: Task) => {
    const newTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(newTasks);
    store.saveTasks(newTasks);
  };

  const handleToggleTask = (taskId: string) => {
    const newTasks = tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(newTasks);
    store.saveTasks(newTasks);
  };
  
  const handleDeleteTask = (taskId: string) => {
    const newTasks = tasks.filter(t => t.id !== taskId);
    setTasks(newTasks);
    store.saveTasks(newTasks);
  };

  const handleAddAppointment = (appointment: Appointment) => {
    const newAppointments = [...appointments, appointment];
    setAppointments(newAppointments);
    store.saveAppointments(newAppointments);
  };

  const handleEditAppointment = (updatedAppointment: Appointment) => {
    const newAppointments = appointments.map(a => a.id === updatedAppointment.id ? updatedAppointment : a);
    setAppointments(newAppointments);
    store.saveAppointments(newAppointments);
  };

  const handleAddSequence = (seq: Sequence) => {
    const newSeq = [...sequences, seq];
    setSequences(newSeq);
    store.saveSequences(newSeq);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard deals={deals} />;
      case 'leadgen':
        return <LeadGen onAddContact={handleAddContact} />;
      case 'pipeline':
        return (
          <Pipeline 
            deals={deals} 
            contacts={contacts} 
            onUpdateDeal={handleUpdateDeal} 
            onAddDeal={handleAddDeal} 
            onDeleteDeal={handleDeleteDeal}
          />
        );
      case 'contacts':
        return (
          <Contacts 
            contacts={contacts} 
            deals={deals} 
            sequences={sequences}
            onAddContact={handleAddContact} 
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
          />
        );
      case 'sequences':
        return <Sequences sequences={sequences} onAddSequence={handleAddSequence} />;
      case 'calendar':
        return (
          <Calendar 
            appointments={appointments} 
            contacts={contacts} 
            onAddAppointment={handleAddAppointment}
            onEditAppointment={handleEditAppointment} 
          />
        );
      case 'tasks':
        return (
          <Tasks 
            tasks={tasks} 
            onAddTask={handleAddTask} 
            onEditTask={handleEditTask}
            onToggleTask={handleToggleTask} 
            onDeleteTask={handleDeleteTask} 
          />
        );
      default:
        return <Dashboard deals={deals} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
      <AIChat contextData={{ 
        summary: `Total Deals: ${deals.length}, Citas este mes: ${appointments.length}, Tareas pendientes: ${tasks.filter(t => !t.completed).length}`,
        recentDeals: deals.slice(0, 5),
        upcomingAppointments: appointments.filter(a => new Date(a.date) >= new Date()).slice(0,3),
        contactsCount: contacts.length,
        activeSequences: sequences.length
      }} />
    </Layout>
  );
}

export default App;