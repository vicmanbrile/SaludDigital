import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  User, 
  Pill, 
  Clock, 
  FileText, 
  ClipboardList,
  Plus,
  Stethoscope,
  Calendar,
  ChevronRight,
  Scale,
  FileBadge,
  MoreVertical,
  History,
  X,
  ChevronLeft,
  Search,
  Users
} from 'lucide-react';

const App = () => {
  const [selectedId, setSelectedId] = useState('p1');
  const [showRightDrawer, setShowRightDrawer] = useState(false);
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de Agenda
  const agenda = [
    { 
      id: 'p1', 
      name: 'Carlos Ruiz', 
      age: 45,
      time: '09:00',
      reason: 'Control de Hipertensión',
      status: 'En Espera',
      statusColor: 'bg-blue-500',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      vitals: { weight: '82kg', height: '1.75m', bp: '135/85', temp: '36.5', imc: '26.8' },
      meds: [
        { name: 'Losartán', dose: '50mg', frequency: 'Cada 24h' },
        { name: 'Amlodipino', dose: '5mg', frequency: 'Cada 24h' }
      ],
      history: 'Paciente hipertenso desde hace 5 años. Refiere cefalea ocasional.'
    },
    { 
      id: 'p2', 
      name: 'Elena Martínez', 
      age: 62,
      time: '09:30',
      reason: 'Resultados de Analítica',
      status: 'En Triaje',
      statusColor: 'bg-yellow-500',
      img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      vitals: { weight: '65kg', height: '1.60m', bp: '120/75', temp: '36.2', imc: '25.4' },
      meds: [
        { name: 'Metformina', dose: '850mg', frequency: 'Con la cena' }
      ],
      history: 'Diabetes Tipo 2 controlada. Acude para revisión trimestral.'
    },
    { 
      id: 'p3', 
      name: 'Jorge Sánchez', 
      age: 28,
      time: '10:00',
      reason: 'Cuadro Gripal / Fiebre',
      status: 'Urgente',
      statusColor: 'bg-red-500',
      img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      vitals: { weight: '74kg', height: '1.80m', bp: '110/70', temp: '38.8', imc: '22.8' },
      meds: [],
      history: 'Inició ayer con rinorrea, tos seca y picos febriles. No alergias.'
    }
  ];

  // Filtrado de pacientes
  const filteredPatients = useMemo(() => {
    return agenda.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const activePatient = agenda.find(p => p.id === selectedId);

  const SignCard = ({ icon: Icon, label, value, colorClass }) => (
    <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${colorClass}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-sm md:text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans relative">
      
      {/* OVERLAY / BACKDROP (Cierra cualquier drawer abierto) */}
      {(showRightDrawer || showLeftDrawer) && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
          onClick={() => {
            setShowRightDrawer(false);
            setShowLeftDrawer(false);
          }}
        />
      )}

      {/* PANEL LATERAL IZQUIERDO (Drawer de Agenda y Búsqueda) */}
      <aside className={`
        fixed top-0 left-0 h-full w-[320px] bg-white z-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col
        ${showLeftDrawer ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <Users size={18} />
                </div>
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Agenda del Día</h3>
             </div>
             <button onClick={() => setShowLeftDrawer(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-white shadow-sm rounded-full border border-slate-100">
               <X size={18} />
             </button>
          </div>

          {/* Barra de Búsqueda */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar paciente..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedId(p.id);
                  setShowLeftDrawer(false);
                }}
                className={`
                  w-full flex items-center gap-4 p-3 rounded-2xl transition-all border
                  ${selectedId === p.id 
                    ? 'bg-indigo-50 border-indigo-100 ring-1 ring-indigo-200' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'}
                `}
              >
                <div className="relative">
                  <img src={p.img} className="w-11 h-11 rounded-xl object-cover" alt="" />
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${p.statusColor}`} />
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className={`font-bold text-sm truncate ${selectedId === p.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {p.name}
                  </p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{p.time}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${selectedId === p.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                      {p.id}
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                    <Search size={24} />
                </div>
                <p className="text-sm font-bold text-slate-400 italic">No se encontraron pacientes</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100">
           <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
             {agenda.length} Pacientes en total
           </p>
        </div>
      </aside>

      {/* PANEL LATERAL DERECHO (Drawer de Acciones Médicas) */}
      <aside className={`
        fixed top-0 right-0 h-full w-[300px] bg-white z-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col
        ${showRightDrawer ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button onClick={() => setShowRightDrawer(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-white shadow-sm rounded-full">
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Opciones Médicas</h3>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="p-4 rounded-3xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-100">
            <div className="flex items-center gap-3 mb-4">
              <img src={activePatient.img} className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20" alt="" />
              <div>
                <p className="font-bold leading-none">{activePatient.name}</p>
                <p className="text-[10px] opacity-70 mt-1 uppercase font-black">{activePatient.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/10 p-2 rounded-xl text-center">
                <p className="text-[9px] opacity-70 uppercase font-bold">Edad</p>
                <p className="text-sm font-bold">{activePatient.age}</p>
              </div>
              <div className="bg-white/10 p-2 rounded-xl text-center">
                <p className="text-[9px] opacity-70 uppercase font-bold">Peso</p>
                <p className="text-sm font-bold">{activePatient.vitals.weight}</p>
              </div>
            </div>
          </div>

          <button className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all active:scale-95 text-left">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Nueva Consulta</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">Registro de síntomas y plan</p>
            </div>
          </button>

          <button className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all active:scale-95 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <History size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Antecedentes</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">Historial patológico y familiar</p>
            </div>
          </button>

          <button className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all active:scale-95 text-left">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Laboratorios</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">Resultados y solicitudes</p>
            </div>
          </button>

          <button className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all active:scale-95 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <FileBadge size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Certificados</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">Reposo o constancia médica</p>
            </div>
          </button>
        </div>

        <div className="mt-auto p-6">
           <button 
             onClick={() => setShowRightDrawer(false)}
             className="w-full p-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
           >
             Cerrar Panel
           </button>
        </div>
      </aside>

      {/* SIDEBAR DE ICONOS (Izquierda) */}
      <nav className="w-16 md:w-20 bg-white border-r border-slate-200 flex flex-col items-center py-4 md:py-6 gap-4 md:gap-6 shadow-sm z-20">
        
        {/* BOTÓN TRIGGER PANEL IZQUIERDO */}
        <button 
          onClick={() => setShowLeftDrawer(true)}
          className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-2 shadow-lg shadow-indigo-100 hover:scale-110 active:scale-95 transition-all"
        >
          <Stethoscope size={22} />
        </button>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar">
          {agenda.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedId(p.id);
                setShowRightDrawer(false);
                setShowLeftDrawer(false);
              }}
              className="relative flex flex-col items-center group"
            >
              <div className={`
                w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border-2 transition-all
                ${selectedId === p.id ? 'border-indigo-600 scale-110 shadow-md' : 'border-transparent opacity-60'}
              `}>
                <img src={p.img} alt="" className="w-full h-full object-cover" />
              </div>
              <span className={`text-[8px] font-black mt-1 ${selectedId === p.id ? 'text-indigo-600' : 'text-slate-300'}`}>
                {p.time}
              </span>
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setShowLeftDrawer(true)}
          className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"
        >
            <Search size={20} />
        </button>
      </nav>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* CABECERA INTERACTIVA */}
        <header className="bg-white border-b border-slate-200 p-4 md:p-6 z-30 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            
            {/* Botón de Identidad del Paciente (Abre panel derecho) */}
            <button 
              onClick={() => setShowRightDrawer(true)}
              className="flex items-center gap-3 md:gap-4 text-left p-1 pr-4 rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-all group border border-transparent hover:border-slate-100"
            >
              <div className="relative">
                <img src={activePatient.img} className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover shadow-sm" alt="" />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${activePatient.statusColor}`} />
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-none">
                    {activePatient.name}
                  </h1>
                  <div className="p-1 bg-indigo-50 rounded-lg text-indigo-600">
                    <ChevronRight size={14} className={showRightDrawer ? 'rotate-180' : ''} />
                  </div>
                </div>
                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wide mt-1">
                    {activePatient.age} años • {activePatient.reason}
                </p>
              </div>
            </button>

            <button className="p-3 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* ESPACIO DE TRABAJO */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* Signos Vitales */}
          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity size={12} /> Exploración Actual
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <SignCard icon={Scale} label="Peso" value={activePatient.vitals.weight} colorClass="bg-emerald-500" />
              <SignCard icon={Activity} label="Presión" value={activePatient.vitals.bp} colorClass="bg-rose-500" />
              <SignCard icon={Thermometer} label="Temp" value={activePatient.vitals.temp} colorClass="bg-amber-500" />
              <SignCard icon={User} label="Talla" value={activePatient.vitals.height} colorClass="bg-sky-500" />
              <SignCard icon={Heart} label="IMC" value={activePatient.vitals.imc} colorClass="bg-indigo-500" />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 md:pb-0">
            
            {/* Notas Clínicas */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <FileText size={18} className="text-indigo-600" />
                    <h3 className="text-sm uppercase tracking-wider">Evolución de Consulta</h3>
                  </div>
                </div>
                <textarea 
                  className="flex-1 w-full p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50 outline-none text-slate-600 text-sm leading-relaxed italic resize-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  defaultValue={activePatient.history}
                  placeholder="Escriba aquí la nota de la evolución..."
                />
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Autoguardado hace 2m</p>
                  <button className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-transform">
                    Finalizar
                  </button>
                </div>
              </div>
            </div>

            {/* Tratamiento Activo */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm h-fit">
              <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Pill size={14} className="text-purple-600" /> Medicación Actual
              </h3>
              <div className="space-y-2">
                {activePatient.meds.length > 0 ? (
                  activePatient.meds.map((med, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-purple-200 transition-colors">
                      <p className="text-xs font-bold text-slate-700">{med.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{med.dose} • {med.frequency}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-300 italic py-4 text-center">Sin tratamiento registrado</p>
                )}
                <button className="w-full p-3 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-[10px] font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all uppercase tracking-widest mt-2">
                  + Recetar
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* BOTÓN FLOTANTE */}
        <button 
          onClick={() => setShowRightDrawer(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full text-white shadow-2xl shadow-indigo-200 flex items-center justify-center active:scale-90 transition-transform z-30"
        >
          <Plus size={28} />
        </button>

      </main>
    </div>
  );
};

export default App;