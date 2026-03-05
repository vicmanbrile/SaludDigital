import React, { useState, useMemo } from 'react';
import { Activity, Thermometer, User, Heart, Scale, ChevronRight, MoreVertical } from 'lucide-react';
import SignCard from './SignCard';
import IconSidebar from './IconSideBar';
import PatientDrawer from './PatientDrawer';
import ClinicalWorkspace from './ClinicalWorkspace';
import './App.css';



const AGENDA = [
  { id: 'p1', name: 'Carlos Ruiz', age: 45, time: '09:00', reason: 'Control', statusColor: 'bg-blue-500', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', vitals: { weight: '82kg', height: '1.75m', bp: '135/85', temp: '36.5', imc: '26.8' }, meds: [], history: '...' },
  { id: 'p2', name: 'Elena Martínez', age: 62, time: '09:30', reason: 'Analítica', statusColor: 'bg-yellow-500', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', vitals: { weight: '65kg', height: '1.60m', bp: '120/75', temp: '36.2', imc: '25.4' }, meds: [], history: '...' },
  { id: 'p3', name: 'Jorge Sánchez', age: 28, time: '10:00', reason: 'Gripe', statusColor: 'bg-red-500', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', vitals: { weight: '74kg', height: '1.80m', bp: '110/70', temp: '38.8', imc: '22.8' }, meds: [], history: '...' }
];

const App = () => {
  const [selectedId, setSelectedId] = useState('p1');
  const [showRightDrawer, setShowRightDrawer] = useState(false);
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const activePatient = useMemo(() => AGENDA.find(p => p.id === selectedId) || AGENDA[0] , [selectedId]);

  const handleSelectPatient = (id) => {
    setSelectedId(id);
    setShowLeftDrawer(false);
    setShowRightDrawer(false);
  };

  const filteredPatients = useMemo(() => 
    AGENDA.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  , [searchTerm]);

  return (
    <div className="app-viewport">
      
      {(showRightDrawer || showLeftDrawer) && (
        <div className="overlay-backdrop" onClick={() => { setShowRightDrawer(false); setShowLeftDrawer(false); }} />
      )}

      <PatientDrawer 
        isOpen={showLeftDrawer} 
        onClose={() => setShowLeftDrawer(false)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        patients={filteredPatients}
        selectedId={selectedId}
        onSelect={handleSelectPatient}
      />

      <IconSidebar 
        agenda={AGENDA} 
        selectedId={selectedId} 
        onSelect={handleSelectPatient} 
        onOpenSearch={() => setShowLeftDrawer(true)} 
      />

      <main className="main-content">
        
        <header className="patient-header">
          <div className="header-container">
            <button onClick={() => setShowRightDrawer(true)} className="patient-profile-trigger">
              <div className="relative">
                <img src={activePatient.img} className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover" alt="" />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${activePatient.statusColor}`} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg md:text-xl font-black text-slate-800">{activePatient.name}</h1>
                  <ChevronRight size={14} className="text-indigo-600" />
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase">{activePatient.age} años • {activePatient.reason}</p>
              </div>
            </button>
            <button className="p-3 text-slate-300"><MoreVertical size={20} /></button>
          </div>
        </header>

        <div className="content-scroll-area">
          <section>
            <h2 className="section-label"><Activity size={12} /> Exploración Actual</h2>
            <div className="vitals-grid">
              <SignCard icon={Scale} label="Peso" value={activePatient.vitals.weight} colorClass="bg-emerald-500" />
              <SignCard icon={Activity} label="Presión" value={activePatient.vitals.bp} colorClass="bg-rose-500" />
              <SignCard icon={Thermometer} label="Temp" value={activePatient.vitals.temp} colorClass="bg-amber-500" />
              <SignCard icon={User} label="Talla" value={activePatient.vitals.height} colorClass="bg-sky-500" />
              <SignCard icon={Heart} label="IMC" value={activePatient.vitals.imc} colorClass="bg-indigo-500" />
            </div>
          </section>

          <ClinicalWorkspace key={activePatient.id} patient={activePatient} />
        </div>
      </main>
    </div>
  );
};

export default App;