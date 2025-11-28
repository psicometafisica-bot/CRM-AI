
import { Contact, Deal, DealStage, Task, User, Appointment, Sequence, SystemSettings } from '../types';

// Initial Mock Data
const INITIAL_CONTACTS: Contact[] = [
  { 
    id: '1', 
    name: 'Carlos Ruiz', 
    email: 'carlos@techcorp.com', 
    phone: '+34 600 123 456', 
    company: 'TechCorp', 
    role: 'CTO', 
    lastContact: '2023-10-25', 
    notes: 'Interesado en planes Enterprise.',
    linkedIn: 'linkedin.com/in/carlos-ruiz-tech',
    technologies: ['AWS', 'React', 'Node.js'],
    enrichmentStatus: 'enriched',
    location: 'Madrid, ES'
  },
  { 
    id: '2', 
    name: 'Maria Gomez', 
    email: 'maria@innovate.es', 
    phone: '+34 600 987 654', 
    company: 'Innovate SL', 
    role: 'CEO', 
    lastContact: '2023-10-20', 
    notes: 'Presupuesto ajustado, busca descuento.',
    enrichmentStatus: 'pending'
  },
  { 
    id: '3', 
    name: 'Juan Perez', 
    email: 'juan@soluciones.com', 
    phone: '+34 600 555 111', 
    company: 'Soluciones Web', 
    role: 'Gerente', 
    lastContact: '2023-10-27', 
    notes: 'Cliente antiguo, posible upsell.',
    technologies: ['WordPress', 'PHP'],
    enrichmentStatus: 'enriched'
  },
];

const INITIAL_DEALS: Deal[] = [
  { id: '1', title: 'Licencia Enterprise - 50 Usuarios', amount: 15000, stage: DealStage.NEGOCIACION, contactId: '1', probability: 75, expectedCloseDate: '2023-11-15', observations: 'El cliente pide integración con SAP antes de firmar.' },
  { id: '2', title: 'Consultoría Mensual', amount: 2500, stage: DealStage.PROPUESTA, contactId: '2', probability: 40, expectedCloseDate: '2023-11-01', observations: 'Enviar comparativa de precios.' },
  { id: '3', title: 'Renovación Anual', amount: 5000, stage: DealStage.CERRADO_GANADO, contactId: '3', probability: 100, expectedCloseDate: '2023-10-15', observations: 'Renovación exitosa por 2 años.' },
  { id: '4', title: 'Implementación CRM', amount: 8000, stage: DealStage.LEAD, contactId: '1', probability: 20, expectedCloseDate: '2023-12-01', observations: '' },
];

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Enviar contrato a TechCorp', dueDate: '2023-10-30', completed: false, assignedTo: 'user1', observations: 'Revisar cláusula de confidencialidad antes de enviar.' },
  { id: '2', title: 'Llamada de seguimiento Maria', dueDate: '2023-10-28', completed: true, assignedTo: 'user1', observations: '' },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { 
    id: '1', 
    title: 'Demo de Producto', 
    date: new Date().toISOString().split('T')[0], 
    time: '10:00', 
    endTime: '11:00',
    description: 'Presentación completa de funcionalidades.', 
    contactId: '1', 
    type: 'demo',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    guests: ['1']
  },
];

const INITIAL_SEQUENCES: Sequence[] = [
  {
    id: '1',
    name: 'Prospección en Frío (SaaS)',
    targetAudience: 'CTOs de empresas tecnológicas',
    enrolledCount: 12,
    steps: [
      { id: 's1', day: 1, type: 'email', subject: 'Pregunta rápida sobre su stack', content: 'Hola {{name}},\n\nVi que en {{company}} están utilizando AWS...' },
      { id: 's2', day: 3, type: 'linkedin', content: 'Conectar y enviar nota: "Hola {{name}}, te envié un correo el otro día..."' },
      { id: 's3', day: 6, type: 'email', subject: 'Re: Pregunta rápida', content: 'Solo quería asegurarme de que viste mi último correo...' },
      { id: 's4', day: 8, type: 'call', content: 'Llamar al número directo. Si no contesta, dejar voicemail.' },
    ]
  }
];

const INITIAL_USER: User = {
  id: 'user1',
  name: 'Usuario Demo',
  email: 'admin@nexus-crm.com',
  role: 'Admin',
  status: 'active',
  avatar: 'https://picsum.photos/100/100'
};

const INITIAL_TEAM: User[] = [
    { id: 'user1', name: 'Usuario Demo', email: 'admin@nexus.com', role: 'Admin', status: 'active', avatar: 'https://picsum.photos/100/100' },
    { id: 'user2', name: 'Ana Garcia', email: 'ana.ventas@nexus.com', role: 'Ventas', status: 'active', avatar: 'https://picsum.photos/101/101' },
    { id: 'user3', name: 'Roberto Diaz', email: 'roberto@nexus.com', role: 'Ventas', status: 'away', avatar: 'https://picsum.photos/102/102' },
    { id: 'user4', name: 'Lucia M', email: 'lucia@nexus.com', role: 'Manager', status: 'active', avatar: 'https://picsum.photos/103/103' },
];

const INITIAL_SETTINGS: SystemSettings = {
    notifications: { deals: true, tasks: true },
    apiKey: '',
    billing: {
        last4: '4242',
        brand: 'Mastercard',
        expiry: '12/28',
        cardHolder: 'Usuario Demo'
    }
};

// LocalStorage Keys
const KEYS = {
  CONTACTS: 'crm_contacts',
  DEALS: 'crm_deals',
  TASKS: 'crm_tasks',
  APPOINTMENTS: 'crm_appointments',
  SEQUENCES: 'crm_sequences',
  USER: 'crm_current_user',
  TEAM: 'crm_team',
  SETTINGS: 'crm_settings'
};

const loadData = <T,>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
};

export const store = {
  getContacts: (): Contact[] => loadData(KEYS.CONTACTS, INITIAL_CONTACTS),
  saveContacts: (contacts: Contact[]) => localStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts)),
  
  getDeals: (): Deal[] => loadData(KEYS.DEALS, INITIAL_DEALS),
  saveDeals: (deals: Deal[]) => localStorage.setItem(KEYS.DEALS, JSON.stringify(deals)),
  
  getTasks: (): Task[] => loadData(KEYS.TASKS, INITIAL_TASKS),
  saveTasks: (tasks: Task[]) => localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks)),

  getAppointments: (): Appointment[] => loadData(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS),
  saveAppointments: (appointments: Appointment[]) => localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments)),

  getSequences: (): Sequence[] => loadData(KEYS.SEQUENCES, INITIAL_SEQUENCES),
  saveSequences: (seq: Sequence[]) => localStorage.setItem(KEYS.SEQUENCES, JSON.stringify(seq)),

  getCurrentUser: (): User => loadData(KEYS.USER, INITIAL_USER),
  saveCurrentUser: (user: User) => localStorage.setItem(KEYS.USER, JSON.stringify(user)),

  getTeam: (): User[] => loadData(KEYS.TEAM, INITIAL_TEAM),
  saveTeam: (team: User[]) => localStorage.setItem(KEYS.TEAM, JSON.stringify(team)),

  getSettings: (): SystemSettings => loadData(KEYS.SETTINGS, INITIAL_SETTINGS),
  saveSettings: (settings: SystemSettings) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)),
};
