import React from 'react';
import { Users, X, Search } from 'lucide-react';
import './PatientDrawer.css';

const PatientDrawer = ({ isOpen, onClose, searchTerm, setSearchTerm, patients, selectedId, onSelect }) => (
  <aside className={`drawer-container ${isOpen ? 'drawer-open' : 'drawer-closed'}`}>
    
    <div className="drawer-header">
      <div className="header-top">
         <div className="flex items-center gap-2">
            <div className="icon-box-sm">
                <Users size={18} />
            </div>
            <h3 className="drawer-title">Agenda del Día</h3>
         </div>
         <button onClick={onClose} className="btn-close-drawer">
           <X size={18} />
         </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Buscar paciente..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>

    <div className="patient-list-area">
      {patients.length > 0 ? (
        patients.map((p) => {
          const isActive = selectedId === p.id;
          
          return (
            <button
              key={p.id}
              onClick={() => { onSelect(p.id); onClose(); }}
              className={`patient-card ${isActive ? 'card-active' : 'card-inactive'}`}
            >
              <div className="relative">
                <img src={p.img} className="w-11 h-11 rounded-xl object-cover" alt="" />
                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${p.statusColor}`} />
              </div>
              
              <div className="flex-1 text-left overflow-hidden">
                <p className={`patient-name-sm ${isActive ? 'name-active' : 'name-inactive'}`}>
                  {p.name}
                </p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{p.time}</span>
                  <span className={`id-badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
                    {p.id}
                  </span>
                </div>
              </div>
            </button>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <Search size={24} className="text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-400 italic">No se encontraron pacientes</p>
        </div>
      )}
    </div>
  </aside>
);

export default PatientDrawer;