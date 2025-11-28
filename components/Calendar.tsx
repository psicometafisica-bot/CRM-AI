import React, { useState } from 'react';
import { Appointment, Contact } from '../types';
import { ChevronLeft, ChevronRight, Clock, Plus, Video, MapPin, AlignLeft, Search, Users, X, Copy, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';

interface CalendarProps {
  appointments: Appointment[];
  contacts: Contact[];
  onAddAppointment: (appointment: Appointment) => void;
  onEditAppointment: (appointment: Appointment) => void;
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

const Calendar: React.FC<CalendarProps> = ({ appointments, contacts, onAddAppointment, onEditAppointment }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters State
  const [visibleTypes, setVisibleTypes] = useState({
    meeting: true,
    call: true,
    demo: true
  });

  // Form State
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newMeetLink, setNewMeetLink] = useState('');
  const [newGuests, setNewGuests] = useState<string[]>([]);
  const [newType, setNewType] = useState<Appointment['type']>('meeting');
  
  // Guest Search State
  const [guestSearch, setGuestSearch] = useState('');
  const [showGuestList, setShowGuestList] = useState(false);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const daysShort = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const CELL_HEIGHT = 60; // 60px per hour for perfect math

  // --- Date Helpers ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 = Sun

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Adjust so week starts on Sunday
    return new Date(d.setDate(diff));
  };

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // --- Navigation Handlers ---
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
    if (viewMode === 'agenda') newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
    if (viewMode === 'agenda') newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  const generateMeetLink = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      const part1 = Array(3).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
      const part2 = Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
      const part3 = Array(3).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
      setNewMeetLink(`meet.google.com/${part1}-${part2}-${part3}`);
  };

  const openAddModal = (dateStr: string, timeStr: string = '09:00') => {
    setEditingAppointmentId(null);
    setSelectedDate(dateStr);
    setNewTitle('');
    setNewTime(timeStr);
    // Default end time +1 hour
    const [h, m] = timeStr.split(':').map(Number);
    const endH = (h + 1).toString().padStart(2, '0');
    setNewEndTime(`${endH}:${m.toString().padStart(2, '0')}`);
    
    setNewDesc('');
    setNewLocation('');
    setNewMeetLink('');
    setNewGuests([]);
    setNewType('meeting');
    setGuestSearch('');
    setIsModalOpen(true);
  };

  const openEditModal = (apt: Appointment) => {
    setEditingAppointmentId(apt.id);
    setSelectedDate(apt.date);
    setNewTitle(apt.title);
    setNewTime(apt.time);
    setNewEndTime(apt.endTime || apt.time); // Fallback if no end time
    setNewDesc(apt.description);
    setNewLocation(apt.location || '');
    setNewMeetLink(apt.meetLink || '');
    setNewGuests(apt.guests || []);
    setNewType(apt.type);
    setGuestSearch('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAppointmentId) {
        // Update existing
        const updatedApt: Appointment = {
            id: editingAppointmentId,
            title: newTitle || '(Sin título)',
            date: selectedDate,
            time: newTime,
            endTime: newEndTime,
            description: newDesc,
            location: newLocation,
            meetLink: newMeetLink,
            guests: newGuests,
            contactId: newGuests.length > 0 ? newGuests[0] : undefined,
            type: newType
        };
        onEditAppointment(updatedApt);
    } else {
        // Create new
        const appointment: Appointment = {
            id: Date.now().toString(),
            title: newTitle || '(Sin título)',
            date: selectedDate,
            time: newTime,
            endTime: newEndTime,
            description: newDesc,
            location: newLocation,
            meetLink: newMeetLink,
            guests: newGuests,
            contactId: newGuests.length > 0 ? newGuests[0] : undefined, 
            type: newType
        };
        onAddAppointment(appointment);
    }
    
    setIsModalOpen(false);
  };

  const toggleFilter = (type: 'meeting' | 'call' | 'demo') => {
    setVisibleTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const addGuest = (contactId: string) => {
    if (!newGuests.includes(contactId)) {
        setNewGuests([...newGuests, contactId]);
    }
    setGuestSearch('');
    setShowGuestList(false);
  };

  const removeGuest = (contactId: string) => {
    setNewGuests(newGuests.filter(id => id !== contactId));
  };

  const getContactDetails = (id: string) => contacts.find(c => c.id === id);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(guestSearch.toLowerCase()) && 
    !newGuests.includes(c.id)
  );

  // --- RENDERERS ---

  const renderMiniCalendar = () => {
    const miniDate = currentDate;
    const totalDays = getDaysInMonth(miniDate.getFullYear(), miniDate.getMonth());
    const startDay = getFirstDayOfMonth(miniDate.getFullYear(), miniDate.getMonth());
    const days = [];

    for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} className="h-6 w-6"></div>);
    for (let i = 1; i <= totalDays; i++) {
        const isToday = new Date().toDateString() === new Date(miniDate.getFullYear(), miniDate.getMonth(), i).toDateString();
        days.push(
            <div key={i} className={`h-6 w-6 text-xs flex items-center justify-center rounded-full cursor-pointer ${isToday ? 'bg-primary text-white font-bold' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => {
                setCurrentDate(new Date(miniDate.getFullYear(), miniDate.getMonth(), i));
            }}>
                {i}
            </div>
        );
    }
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-sm font-bold text-gray-700">{monthNames[miniDate.getMonth()]} {miniDate.getFullYear()}</span>
            </div>
            <div className="grid grid-cols-7 text-center gap-y-1">
                {['D','L','M','M','J','V','S'].map(d => <span key={d} className="text-[10px] text-gray-500 font-medium">{d}</span>)}
                {days}
            </div>
        </div>
    );
  };

  // 1. MONTH VIEW
  const renderMonthView = () => {
    const totalDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const startDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const days = [];

    // Header
    const header = (
        <div className="grid grid-cols-7 border-b border-gray-200 flex-shrink-0">
            {daysShort.map(d => (
                <div key={d} className="py-2 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    {d}
                </div>
            ))}
        </div>
    );

    // Empty cells previous month
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`prev-${i}`} className="min-h-[120px] border-b border-r border-gray-200 bg-gray-50/30"></div>);
    }

    // Current month cells
    for (let day = 1; day <= totalDays; day++) {
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        const dateStr = `${currentDate.getFullYear()}-${month}-${dayStr}`;
        const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
        
        // SORTING FIX: Sort appointments by time
        const dayAppointments = appointments
            .filter(a => a.date === dateStr && visibleTypes[a.type])
            .sort((a, b) => a.time.localeCompare(b.time));

        days.push(
            <div 
                key={day} 
                onClick={() => openAddModal(dateStr)}
                className={`min-h-[120px] border-b border-r border-gray-200 p-2 transition-colors hover:bg-gray-50 cursor-pointer relative group`}
            >
                <div className="flex justify-center mb-1">
                    <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : 'text-gray-700'}`}>
                        {day}
                    </span>
                </div>
                <div className="space-y-1">
                    {dayAppointments.map(apt => (
                        <div 
                            key={apt.id} 
                            onClick={(e) => { e.stopPropagation(); openEditModal(apt); }} 
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate border shadow-sm flex items-center gap-1 cursor-pointer hover:opacity-80 ${
                                apt.type === 'meeting' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                apt.type === 'call' ? 'bg-green-100 text-green-700 border-green-200' :
                                'bg-purple-100 text-purple-700 border-purple-200'
                            }`}
                        >
                            <span className="font-bold">{apt.time}</span>
                            <span className="truncate">{apt.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    // Fill
    const remainingCells = 42 - days.length;
    for(let i=0; i<remainingCells; i++) days.push(<div key={`next-${i}`} className="min-h-[120px] border-b border-r border-gray-200 bg-gray-50/30"></div>);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {header}
            <div className="grid grid-cols-7 auto-rows-fr overflow-y-auto h-full">
                {days}
            </div>
        </div>
    );
  };

  // 2. WEEK VIEW
  const renderWeekView = () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Week Header */}
            <div className="flex border-b border-gray-200 ml-14 overflow-y-scroll scrollbar-hide">
                {weekDays.map((d, i) => {
                    const isToday = d.toDateString() === new Date().toDateString();
                    return (
                        <div key={i} className="flex-1 py-4 text-center border-l border-gray-200 min-w-[100px]">
                            <div className={`text-xs font-medium uppercase ${isToday ? 'text-primary' : 'text-gray-500'}`}>{daysShort[d.getDay()]}</div>
                            <div className={`text-xl mt-1 w-10 h-10 mx-auto flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white font-bold' : 'text-gray-700'}`}>
                                {d.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Week Grid */}
            <div className="flex-1 overflow-y-auto relative">
                <div className="flex">
                    {/* Time Axis */}
                    <div className="w-14 flex-shrink-0 border-r border-gray-200 bg-white sticky left-0 z-10">
                        {hours.map(h => (
                            <div key={h} className="text-xs text-gray-400 text-right pr-2 -mt-2.5 box-border" style={{ height: `${CELL_HEIGHT}px` }}>
                                {h === 0 ? '' : `${h}:00`}
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    <div className="flex flex-1">
                        {weekDays.map((d, i) => {
                             const month = (d.getMonth() + 1).toString().padStart(2, '0');
                             const dayStr = d.getDate().toString().padStart(2, '0');
                             const dateStr = `${d.getFullYear()}-${month}-${dayStr}`;
                             
                             const dayAppointments = appointments.filter(a => a.date === dateStr && visibleTypes[a.type]);

                             return (
                                <div key={i} className="flex-1 border-l border-gray-100 min-w-[100px] relative">
                                    {/* Grid Lines */}
                                    {hours.map(h => (
                                        <div 
                                            key={h} 
                                            className="border-b border-gray-50 cursor-pointer hover:bg-gray-50 box-border" 
                                            style={{ height: `${CELL_HEIGHT}px` }}
                                            onClick={() => openAddModal(dateStr, `${h.toString().padStart(2,'0')}:00`)}
                                        ></div>
                                    ))}
                                    
                                    {/* Events */}
                                    {dayAppointments.map(apt => {
                                        const startH = parseInt(apt.time.split(':')[0]);
                                        const startM = parseInt(apt.time.split(':')[1]);
                                        // Precise calculation using fixed CELL_HEIGHT
                                        const top = (startH * CELL_HEIGHT) + ((startM / 60) * CELL_HEIGHT);
                                        
                                        // Calculate duration height
                                        let duration = 60; // default 1 hour
                                        if (apt.endTime) {
                                            const endH = parseInt(apt.endTime.split(':')[0]);
                                            const endM = parseInt(apt.endTime.split(':')[1]);
                                            duration = ((endH * 60 + endM) - (startH * 60 + startM));
                                        }
                                        const height = (duration / 60) * CELL_HEIGHT;

                                        return (
                                            <div 
                                                key={apt.id}
                                                onClick={(e) => { e.stopPropagation(); openEditModal(apt); }}
                                                className={`absolute left-1 right-1 p-1 rounded text-[10px] border shadow-sm overflow-hidden cursor-pointer hover:brightness-95 hover:z-20
                                                    ${apt.type === 'meeting' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                      apt.type === 'call' ? 'bg-green-100 text-green-700 border-green-200' :
                                                      'bg-purple-100 text-purple-700 border-purple-200'}
                                                `}
                                                style={{ top: `${top}px`, height: `${Math.max(height, 20)}px`, zIndex: 10 }}
                                            >
                                                <div className="font-bold">{apt.title}</div>
                                                <div>{apt.time} - {apt.endTime}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                             )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  // 3. DAY VIEW
  const renderDayView = () => {
    const d = currentDate;
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = d.getDate().toString().padStart(2, '0');
    const dateStr = `${d.getFullYear()}-${month}-${dayStr}`;
    const dayAppointments = appointments.filter(a => a.date === dateStr && visibleTypes[a.type]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 p-4 pl-20">
                 <div className="text-xs font-medium uppercase text-primary">{daysShort[d.getDay()]}</div>
                 <div className="text-2xl font-bold text-gray-800">{d.getDate()} {monthNames[d.getMonth()]}</div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto relative">
                 <div className="flex">
                    {/* Time Axis */}
                    <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-white">
                        {hours.map(h => (
                            <div key={h} className="text-xs text-gray-400 text-right pr-3 -mt-2.5 box-border" style={{ height: `${CELL_HEIGHT}px` }}>
                                {h === 0 ? '' : `${h}:00`}
                            </div>
                        ))}
                    </div>
                    {/* Event Area */}
                    <div className="flex-1 relative">
                         {hours.map(h => (
                            <div 
                                key={h} 
                                className="border-b border-gray-100 cursor-pointer hover:bg-gray-50 box-border" 
                                style={{ height: `${CELL_HEIGHT}px` }}
                                onClick={() => openAddModal(dateStr, `${h.toString().padStart(2,'0')}:00`)}
                            ></div>
                         ))}
                         
                         {dayAppointments.map(apt => {
                            const startH = parseInt(apt.time.split(':')[0]);
                            const startM = parseInt(apt.time.split(':')[1]);
                            const top = (startH * CELL_HEIGHT) + ((startM / 60) * CELL_HEIGHT);
                            
                             // Calculate duration height
                             let duration = 60; // default 1 hour
                             if (apt.endTime) {
                                 const endH = parseInt(apt.endTime.split(':')[0]);
                                 const endM = parseInt(apt.endTime.split(':')[1]);
                                 duration = ((endH * 60 + endM) - (startH * 60 + startM));
                             }
                             const height = (duration / 60) * CELL_HEIGHT;

                            return (
                                <div 
                                    key={apt.id}
                                    onClick={(e) => { e.stopPropagation(); openEditModal(apt); }}
                                    className={`absolute left-2 right-4 p-3 rounded-lg border shadow-sm overflow-hidden flex flex-col justify-center cursor-pointer hover:shadow-md
                                        ${apt.type === 'meeting' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            apt.type === 'call' ? 'bg-green-100 text-green-700 border-green-200' :
                                            'bg-purple-100 text-purple-700 border-purple-200'}
                                    `}
                                    style={{ top: `${top}px`, height: `${Math.max(height, 40)}px`, zIndex: 10 }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold text-sm">{apt.title}</div>
                                        {apt.meetLink && <Video size={14}/>}
                                    </div>
                                    <div className="text-xs opacity-90">{apt.time} - {apt.endTime}</div>
                                    {apt.description && <div className="text-xs truncate opacity-75 mt-1">{apt.description}</div>}
                                </div>
                            )
                        })}
                    </div>
                 </div>
            </div>
        </div>
    );
  };

  // 4. AGENDA VIEW
  const renderAgendaView = () => {
    // Flatten and sort appointments
    const sortedApts = [...appointments]
        .filter(a => visibleTypes[a.type])
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

    // Group by date
    const grouped: Record<string, Appointment[]> = {};
    sortedApts.forEach(apt => {
        if (!grouped[apt.date]) grouped[apt.date] = [];
        grouped[apt.date].push(apt);
    });

    const sortedDates = Object.keys(grouped).sort();

    return (
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Agenda</h2>
            {sortedDates.length === 0 ? (
                <div className="text-center text-gray-400 py-12 italic">No hay eventos programados.</div>
            ) : (
                <div className="space-y-8">
                    {sortedDates.map(dateStr => {
                        const dateObj = new Date(dateStr);
                        // Fix timezone offset for display
                        const displayDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
                        
                        return (
                            <div key={dateStr}>
                                <div className="sticky top-0 bg-white pb-2 z-10 border-b border-gray-100 mb-4 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-800">{displayDate.getDate()}</span>
                                    <span className="font-medium text-gray-500 uppercase text-sm">
                                        {daysShort[displayDate.getDay()]}, {monthNames[displayDate.getMonth()]}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {grouped[dateStr].map(apt => (
                                        <div key={apt.id} className="flex gap-4 group">
                                            <div className="w-16 text-right text-xs text-gray-500 pt-3">
                                                {apt.time}
                                            </div>
                                            <div className="relative flex-1">
                                                <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full 
                                                    ${apt.type === 'meeting' ? 'bg-blue-500' : apt.type === 'call' ? 'bg-green-500' : 'bg-purple-500'}
                                                `}></div>
                                                <div className={`ml-3 p-3 rounded-lg border hover:shadow-md transition-shadow cursor-pointer bg-white
                                                    ${apt.type === 'meeting' ? 'border-blue-100' : apt.type === 'call' ? 'border-green-100' : 'border-purple-100'}
                                                `} onClick={() => openEditModal(apt)}>
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-gray-800 text-sm">{apt.title}</h4>
                                                        {apt.meetLink && <div className="bg-blue-50 text-blue-600 p-1 rounded"><Video size={12}/></div>}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 flex gap-3">
                                                        <span>{apt.endTime ? `${apt.time} - ${apt.endTime}` : apt.time}</span>
                                                        {apt.location && <span className="flex items-center gap-1"><MapPin size={10}/> {apt.location}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="flex h-full bg-white flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <button onClick={handleToday} className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700">Hoy</button>
                    <div className="flex gap-1">
                        <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ChevronLeft size={20}/></button>
                        <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ChevronRight size={20}/></button>
                    </div>
                </div>
                <h2 className="text-xl text-gray-800 font-medium">
                    {viewMode === 'agenda' 
                        ? 'Agenda de Eventos' 
                        : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                    }
                </h2>
            </div>
            
            <div className="flex items-center gap-2">
                 <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Search size={20}/></button>
                 <select 
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as ViewMode)}
                    className="border-gray-200 border rounded-md px-3 py-1.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer outline-none focus:ring-2 focus:ring-blue-100"
                 >
                     <option value="month">Mes</option>
                     <option value="week">Semana</option>
                     <option value="day">Día</option>
                     <option value="agenda">Agenda</option>
                 </select>
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* SIDEBAR */}
            <div className="w-64 border-r border-gray-200 p-4 flex-shrink-0 hidden md:block overflow-y-auto">
                <button 
                    onClick={() => {
                        const today = new Date();
                        const month = (today.getMonth() + 1).toString().padStart(2, '0');
                        const day = today.getDate().toString().padStart(2, '0');
                        openAddModal(`${today.getFullYear()}-${month}-${day}`);
                    }}
                    className="w-full mb-8 bg-white border border-gray-200 shadow-md rounded-full py-3 px-6 flex items-center gap-3 hover:shadow-lg hover:bg-gray-50 transition-all group"
                >
                    <div className="bg-white p-1 shadow-sm rounded-full">
                         <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" alt="Google Calendar" className="w-6 h-6"/>
                    </div>
                    <span className="font-medium text-gray-700">Crear</span>
                </button>

                {renderMiniCalendar()}

                <div className="mt-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mis Calendarios</span>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" checked={visibleTypes.meeting} onChange={() => toggleFilter('meeting')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer" />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">Eventos</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" checked={visibleTypes.call} onChange={() => toggleFilter('call')} className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300 cursor-pointer" />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">Llamadas</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" checked={visibleTypes.demo} onChange={() => toggleFilter('demo')} className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300 cursor-pointer" />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">Demos</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'day' && renderDayView()}
                {viewMode === 'agenda' && renderAgendaView()}
            </div>
        </div>

        {/* MODAL */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-[1px]">
              <div className="bg-white rounded-lg w-full max-w-[550px] shadow-2xl overflow-visible animate-in fade-in zoom-in duration-200 relative flex flex-col max-h-[90vh]">
                
                <div className="bg-gray-100 rounded-t-lg px-4 py-2 flex justify-end items-center border-b border-gray-200">
                   <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:bg-gray-200 p-1.5 rounded-full"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
                    <div className="p-6 pb-2 space-y-6">
                        <input 
                            type="text" 
                            autoFocus
                            className="w-full text-2xl text-gray-800 placeholder-gray-400 border-b border-gray-200 focus:border-blue-600 focus:border-b-2 focus:outline-none py-1 transition-all"
                            placeholder="Agregar título"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                        />

                        <div className="flex gap-2">
                            {[
                                { id: 'meeting', label: 'Evento', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                                { id: 'call', label: 'Llamada', color: 'bg-green-100 text-green-700 border-green-200' },
                                { id: 'demo', label: 'Demo', color: 'bg-purple-100 text-purple-700 border-purple-200' }
                            ].map(type => (
                                <button
                                    type="button"
                                    key={type.id}
                                    onClick={() => setNewType(type.id as any)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${newType === type.id ? type.color : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-start gap-4">
                            <Clock className="text-gray-500 mt-1" size={20} />
                            <div className="flex-1 flex flex-wrap items-center gap-2">
                                <div className="bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 text-sm text-gray-700 cursor-pointer relative">
                                    <input type="date" className="absolute inset-0 opacity-0 cursor-pointer" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                                    {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </div>
                                <input type="time" className="bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 text-sm text-gray-700 cursor-pointer border-none focus:ring-0 w-20" value={newTime} onChange={e => setNewTime(e.target.value)} />
                                <span className="text-gray-400">-</span>
                                <input type="time" className="bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 text-sm text-gray-700 cursor-pointer border-none focus:ring-0 w-20" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <Video className="text-gray-500 mt-1.5" size={20} />
                            <div className="flex-1">
                                {newMeetLink ? (
                                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-2 rounded-md">
                                        <div className="bg-blue-600 p-1.5 rounded text-white"><Video size={16}/></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-blue-800 font-bold">Unirse con Google Meet</div>
                                            <div className="text-xs text-blue-600 truncate">{newMeetLink}</div>
                                        </div>
                                        <button type="button" onClick={() => setNewMeetLink('')} className="p-1 hover:bg-blue-100 rounded text-blue-400"><X size={14}/></button>
                                        <button type="button" onClick={() => navigator.clipboard.writeText(`https://${newMeetLink}`)} className="p-1 hover:bg-blue-100 rounded text-blue-400"><Copy size={14}/></button>
                                    </div>
                                ) : (
                                    <button 
                                        type="button" 
                                        onClick={generateMeetLink}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm flex items-center gap-2 transition-colors w-full sm:w-auto"
                                    >
                                        <Video size={18} /> Agregar una videoconferencia de Google Meet
                                    </button>
                                )}
                                <p className="text-[10px] text-gray-400 mt-1">Se admite hasta 100 invitados</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <MapPin className="text-gray-500" size={20} />
                            <input 
                                type="text"
                                className="flex-1 bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-3 py-2 text-sm text-gray-700 border-none transition-all placeholder-gray-500"
                                placeholder="Agregar ubicación"
                                value={newLocation}
                                onChange={e => setNewLocation(e.target.value)}
                            />
                        </div>

                        <div className="flex items-start gap-4">
                            <AlignLeft className="text-gray-500 mt-2" size={20} />
                            <div className="flex-1">
                                <textarea 
                                    className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-3 py-2 text-sm text-gray-700 border-none transition-all placeholder-gray-500 resize-none h-24"
                                    placeholder="Agregar descripción"
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                />
                                <div className="flex gap-2 mt-1 px-1">
                                    <button type="button" className="text-gray-400 hover:text-gray-600 font-bold serif">B</button>
                                    <button type="button" className="text-gray-400 hover:text-gray-600 italic serif">I</button>
                                    <button type="button" className="text-gray-400 hover:text-gray-600 underline serif">U</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <Users className="text-gray-500 mt-2" size={20} />
                            <div className="flex-1">
                                <div className="relative">
                                    {newGuests.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {newGuests.map(id => {
                                                const guest = getContactDetails(id);
                                                return (
                                                    <div key={id} className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700">
                                                        <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">
                                                            {guest?.name.charAt(0) || '?'}
                                                        </div>
                                                        <span>{guest?.name || 'Desconocido'}</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeGuest(id)}
                                                            className="ml-1 text-gray-400 hover:text-red-500 rounded-full"
                                                        >
                                                            <X size={12}/>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <input 
                                        type="text" 
                                        placeholder="Agregar invitados"
                                        className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-3 py-2 text-sm text-gray-700 border-none placeholder-gray-500"
                                        value={guestSearch}
                                        onChange={e => {
                                            setGuestSearch(e.target.value);
                                            setShowGuestList(true);
                                        }}
                                        onFocus={() => setShowGuestList(true)}
                                    />
                                    
                                    {showGuestList && guestSearch && (
                                        <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg z-20">
                                            {filteredContacts.length > 0 ? (
                                                filteredContacts.map(c => (
                                                    <div 
                                                        key={c.id} 
                                                        onClick={() => addGuest(c.id)}
                                                        className="flex items-center gap-2 p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-bold">
                                                            {c.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-800 truncate">{c.name}</div>
                                                            <div className="text-xs text-gray-500 truncate">{c.email}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-3 text-xs text-gray-500 text-center italic">No se encontraron contactos.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-200 flex justify-end gap-2 bg-white sticky bottom-0">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded text-sm font-medium text-gray-600 hover:bg-gray-100">Cancelar</button>
                        <button type="submit" className="px-6 py-2 rounded text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm">
                            {editingAppointmentId ? 'Guardar Cambios' : 'Guardar'}
                        </button>
                    </div>
                </form>
              </div>
            </div>
        )}
    </div>
  );
};

export default Calendar;