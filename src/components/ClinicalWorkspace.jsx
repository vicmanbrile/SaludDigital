import React from 'react';
import { FileText, Pill } from 'lucide-react';
import './ClinicalWorkspace.css';

const ClinicalWorkspace = ({ patient }) => (
  <div className="workspace-grid">
        <div className="notes-container">
      <div className="notes-header">
        <FileText size={18} className="text-indigo-600" />
        <h3 className="text-sm uppercase tracking-wider">Evolución de Consulta</h3>
      </div>
      
      <textarea 
        className="notes-editor"
        defaultValue={patient.history}
        placeholder="Escriba aquí la nota..."
      />
      
      <div className="notes-footer">
        <p className="status-label">Autoguardado hace 2m</p>
        <button className="btn-finalize">
          Finalizar
        </button>
      </div>
    </div>

    <div className="meds-container">
      <h3 className="section-label mb-4">
        <Pill size={14} className="text-purple-600" /> Medicación Actual
      </h3>
      
      <div className="space-y-2">
        {(patient?.meds || []).length > 0 ? (
          patient.meds.map((med, idx) => (
            <div key={idx} className="med-item">
              <p className="text-xs font-bold text-slate-700">{med?.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {med?.dose} • {med?.frequency}
              </p>
            </div>
          ))
        ) : (
          <p className="text-[10px] text-slate-400">Sin medicamentos registrados</p>
        )}
        
        <button className="btn-add-med">
          + Recetar
        </button>
      </div>
    </div>
    
  </div>
);

export default ClinicalWorkspace;