
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Kanban, CheckSquare, Settings, BrainCircuit, Calendar as CalendarIcon, Globe, Send, X, Save, Shield, Mail, Bell, Key, CreditCard, User as UserIcon, Trash2, Plus } from 'lucide-react';
import { User, SystemSettings } from '../types';
import { store } from '../services/store';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(store.getCurrentUser());

  useEffect(() => {
    // Refresh user if settings changed elsewhere (basic sync)
    setCurrentUser(store.getCurrentUser());
  }, [isSettingsOpen]);

  const menuItems = [
    { id: 'dashboard', label: 'Tablero', icon: LayoutDashboard },
    { id: 'leadgen', label: 'Prospección IA', icon: Globe },
    { id: 'pipeline', label: 'Embudo', icon: Kanban },
    { id: 'contacts', label: 'Contactos', icon: Users },
    { id: 'sequences', label: 'Secuencias', icon: Send },
    { id: 'tasks', label: 'Tareas', icon: CheckSquare },
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
  ];

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex flex-shrink-0">
        <div className="p-6 flex items-center space-x-2 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-800">Nexus CRM</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-primary font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Admin Trigger */}
        <div 
            className="p-4 border-t border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors group"
            onClick={() => setIsSettingsOpen(true)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent group-hover:ring-primary transition-all">
               <img src={currentUser.avatar} alt="User" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
            <Settings className="w-5 h-5 text-gray-400 ml-auto group-hover:rotate-90 transition-transform duration-300 group-hover:text-primary" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-gray-50/50">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 md:hidden flex-shrink-0">
             <div className="font-bold text-lg">Nexus CRM</div>
             <button onClick={() => setIsSettingsOpen(true)}><Settings size={24} className="text-gray-600"/></button>
        </header>
        {/* Contenedor principal con ancho completo y padding ajustado */}
        <div className="flex-1 overflow-auto p-6 w-full">
          {children}
        </div>
      </main>

      {/* Admin Settings Modal */}
      {isSettingsOpen && (
          <UserSettingsModal 
            onClose={() => {
                setIsSettingsOpen(false);
                setCurrentUser(store.getCurrentUser()); // Refresh local state on close
            }} 
          />
      )}
    </div>
  );
};

const UserSettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'settings'>('profile');
    
    // Data States
    const [profile, setProfile] = useState<User>(store.getCurrentUser());
    const [team, setTeam] = useState<User[]>([]);
    
    // Initial State must include billing to avoid crash if older version of localstorage
    const [settings, setSettings] = useState<SystemSettings>(() => {
        const s = store.getSettings();
        if (!s.billing) {
            s.billing = { last4: '4242', brand: 'Mastercard', expiry: '12/28', cardHolder: 'Usuario Demo' };
        }
        return s;
    });
    
    // UI States
    const [isApiKeyEditing, setIsApiKeyEditing] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    
    // Team UI States
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    // Billing UI States
    const [isBillingEditing, setIsBillingEditing] = useState(false);
    const [billingForm, setBillingForm] = useState({
        cardHolder: '',
        cardNumber: '',
        expiry: '',
        cvc: ''
    });

    useEffect(() => {
        setTeam(store.getTeam());
        // Reload settings to ensure we have fresh data
        const s = store.getSettings();
        // ensure billing exists fallback
        if (!s.billing) s.billing = { last4: '4242', brand: 'Mastercard', expiry: '12/28', cardHolder: 'Usuario Demo' };
        setSettings(s);
        setApiKeyInput(s.apiKey || '');
        setBillingForm({
            cardHolder: s.billing.cardHolder,
            cardNumber: `**** **** **** ${s.billing.last4}`,
            expiry: s.billing.expiry,
            cvc: '***'
        });
    }, []);

    // --- Profile Logic ---
    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        store.saveCurrentUser(profile);
        // Also update in team list if exists
        const updatedTeam = team.map(u => u.id === profile.id ? profile : u);
        setTeam(updatedTeam);
        store.saveTeam(updatedTeam);
        alert('Perfil actualizado correctamente.');
    };

    // --- Team Logic ---
    const handleInviteUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (inviteEmail) {
            const newUser: User = {
                id: `user-${Date.now()}`,
                name: inviteEmail.split('@')[0],
                email: inviteEmail,
                role: 'Ventas',
                status: 'active',
                avatar: `https://picsum.photos/10${team.length}/10${team.length}`
            };
            const newTeam = [...team, newUser];
            setTeam(newTeam);
            store.saveTeam(newTeam);
            setInviteEmail('');
            setIsInviting(false);
        }
    };

    const handleToggleStatus = (id: string) => {
        const newTeam = team.map(u => {
            if (u.id === id) {
                return { ...u, status: u.status === 'active' ? 'away' : 'active' } as User;
            }
            return u;
        });
        setTeam(newTeam);
        store.saveTeam(newTeam);
    };

    const handleDeleteUser = (id: string) => {
        // Direct delete without confirmation to prevent browser blocking
        const newTeam = team.filter(u => u.id !== id);
        setTeam(newTeam);
        store.saveTeam(newTeam);
    };

    // --- Settings Logic ---
    const handleNotificationToggle = (key: 'deals' | 'tasks') => {
        const newSettings = {
            ...settings,
            notifications: {
                ...settings.notifications,
                [key]: !settings.notifications[key]
            }
        };
        setSettings(newSettings);
        store.saveSettings(newSettings);
    };

    const handleSaveApiKey = () => {
        const newSettings = { ...settings, apiKey: apiKeyInput };
        setSettings(newSettings);
        store.saveSettings(newSettings);
        setIsApiKeyEditing(false);
        alert('API Key guardada. Las funciones de IA usarán esta llave.');
    };

    const handleSaveBilling = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate card processing (extract last 4)
        const last4 = billingForm.cardNumber.slice(-4) || '1111';
        
        const newSettings: SystemSettings = {
            ...settings,
            billing: {
                last4: last4,
                brand: 'Visa', // Mock brand
                expiry: billingForm.expiry,
                cardHolder: billingForm.cardHolder
            }
        };
        setSettings(newSettings);
        store.saveSettings(newSettings);
        setIsBillingEditing(false);
        alert('Método de pago actualizado.');
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Settings className="text-primary" /> Administración del Sistema
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-64 bg-gray-50 border-r border-gray-100 p-4 space-y-2 flex-shrink-0">
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === 'profile' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <UserIcon size={18} /> <span>Mi Perfil</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('team')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === 'team' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Users size={18} /> <span>Equipo & Licencia</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === 'settings' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Shield size={18} /> <span>Configuración</span>
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 overflow-y-auto bg-white">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-6">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative">
                                        <img src={profile.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-gray-100 shadow-sm" />
                                        <button type="button" className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform">
                                            <Save size={14} />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{profile.name}</h3>
                                        <p className="text-gray-500 text-sm">{profile.role}</p>
                                        <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">{profile.status}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                        <input 
                                            type="text" 
                                            value={profile.name}
                                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                                <Mail size={16} />
                                            </span>
                                            <input 
                                                type="email" 
                                                value={profile.email}
                                                onChange={(e) => setProfile({...profile, email: e.target.value})}
                                                className="w-full px-4 py-2 border rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                        <select disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed">
                                            <option>{profile.role}</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Guardar Cambios</button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'team' && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-blue-900 text-lg">Licencia Enterprise</h3>
                                        <p className="text-blue-700 text-sm">Tienes acceso para 50 usuarios.</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-blue-600">{team.length}<span className="text-blue-300 text-xl">/50</span></div>
                                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wide">Asientos Ocupados</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-8 mb-4">
                                    <h3 className="font-bold text-gray-800">Miembros del Equipo</h3>
                                    {!isInviting ? (
                                        <button 
                                            onClick={() => setIsInviting(true)}
                                            disabled={team.length >= 50}
                                            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <Plus size={16} /> Invitar Usuario
                                        </button>
                                    ) : (
                                        <form onSubmit={handleInviteUser} className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <input 
                                                autoFocus
                                                type="email" 
                                                placeholder="Email del usuario..." 
                                                className="px-3 py-1.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                                                value={inviteEmail}
                                                onChange={e => setInviteEmail(e.target.value)}
                                            />
                                            <button type="submit" className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">Enviar</button>
                                            <button type="button" onClick={() => setIsInviting(false)} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200">Cancelar</button>
                                        </form>
                                    )}
                                </div>

                                <div className="border rounded-xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b">
                                            <tr>
                                                <th className="px-6 py-3">Usuario</th>
                                                <th className="px-6 py-3">Rol</th>
                                                <th className="px-6 py-3">Estado</th>
                                                <th className="px-6 py-3 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {team.map((u) => (
                                                <tr key={u.id} className="hover:bg-gray-50 group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{u.name}</div>
                                                        <div className="text-xs text-gray-500">{u.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{u.role}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {u.status === 'active' ? 'Activo' : 'Ausente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-3 items-center">
                                                            <button 
                                                                onClick={() => handleToggleStatus(u.id)}
                                                                className="text-xs font-medium text-blue-600 hover:text-blue-800"
                                                            >
                                                                Cambiar Estado
                                                            </button>
                                                            {u.role !== 'Admin' && (
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleDeleteUser(u.id);
                                                                    }}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                                    title="Eliminar usuario"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="max-w-2xl space-y-8">
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Bell size={18} /> Notificaciones
                                    </h3>
                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <div>
                                                <div className="font-medium text-gray-900">Alertas de Deals</div>
                                                <div className="text-xs text-gray-500">Recibir notificaciones cuando un deal cambie de etapa.</div>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={settings.notifications.deals}
                                                onChange={() => handleNotificationToggle('deals')}
                                                className="w-5 h-5 text-primary rounded" 
                                            />
                                        </label>
                                        <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <div>
                                                <div className="font-medium text-gray-900">Recordatorios de Tareas</div>
                                                <div className="text-xs text-gray-500">Avisarme 1 hora antes de una tarea vencida.</div>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={settings.notifications.tasks}
                                                onChange={() => handleNotificationToggle('tasks')}
                                                className="w-5 h-5 text-primary rounded" 
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Key size={18} /> Seguridad & API
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">API Key (Gemini)</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type={isApiKeyEditing ? "text" : "password"} 
                                                    value={isApiKeyEditing ? apiKeyInput : (settings.apiKey ? "************************" : "")} 
                                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                                    disabled={!isApiKeyEditing}
                                                    placeholder={!isApiKeyEditing && !settings.apiKey ? "No configurada" : ""}
                                                    className="flex-1 px-4 py-2 border rounded-lg bg-white disabled:bg-gray-100 text-gray-700 focus:ring-2 focus:ring-primary outline-none" 
                                                />
                                                {isApiKeyEditing ? (
                                                    <button onClick={handleSaveApiKey} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Guardar</button>
                                                ) : (
                                                    <button onClick={() => setIsApiKeyEditing(true)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Cambiar</button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Esta llave se guardará localmente y se utilizará para todas las funciones de IA del CRM.</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <CreditCard size={18} /> Facturación
                                    </h3>
                                    
                                    {!isBillingEditing ? (
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white p-2 rounded shadow-sm">
                                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-6" alt="Card"/>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800">•••• {settings.billing.last4}</div>
                                                        <div className="text-xs text-gray-500">Expira {settings.billing.expiry} • {settings.billing.cardHolder}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-green-600">Activa</span>
                                                    <button 
                                                        onClick={() => setIsBillingEditing(true)}
                                                        className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        Actualizar Método
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSaveBilling} className="bg-white border border-gray-200 p-4 rounded-lg space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre en la tarjeta</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    className="w-full px-3 py-2 border rounded bg-gray-50"
                                                    value={billingForm.cardHolder}
                                                    onChange={e => setBillingForm({...billingForm, cardHolder: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Número de Tarjeta</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    className="w-full px-3 py-2 border rounded bg-gray-50"
                                                    value={billingForm.cardNumber}
                                                    onChange={e => setBillingForm({...billingForm, cardNumber: e.target.value})}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiración (MM/YY)</label>
                                                    <input 
                                                        type="text" 
                                                        required
                                                        placeholder="MM/YY"
                                                        className="w-full px-3 py-2 border rounded bg-gray-50"
                                                        value={billingForm.expiry}
                                                        onChange={e => setBillingForm({...billingForm, expiry: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVC</label>
                                                    <input 
                                                        type="text" 
                                                        required
                                                        className="w-full px-3 py-2 border rounded bg-gray-50"
                                                        value={billingForm.cvc}
                                                        onChange={e => setBillingForm({...billingForm, cvc: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 pt-2">
                                                <button type="button" onClick={() => setIsBillingEditing(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-blue-700">Guardar Tarjeta</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
