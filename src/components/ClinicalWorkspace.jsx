import React, { useState, useEffect } from 'react';
import { FileText, Pill } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import './ClinicalWorkspace.css';

const client = generateClient();

const ClinicalWorkspace = ({ patient }) => {
  const [notes, setNotes] = useState(patient?.clinicalNotes || '');
  const [meds, setMeds] = useState(patient?.meds || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(patient?.clinicalNotes || '');
    setMeds(patient?.meds ?? []);
  }, [patient]);

  const handleSaveNotes = async () => {
    if (!patient?.id) return;
    setIsSaving(true);
    
    try {
      await client.models.Patient.update({
        id: patient.id,
        clinicalNotes: notes
      });
      alert('Evolución guardada correctamente.');
    } catch (error) {
      console.error("Error al guardar notas:", error);
      alert('Error al guardar. Es posible que no tengas permisos (Solo para DOCTOR).');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMed = async () => {
    if (!patient?.id) return;
    
    const name = prompt("Nombre del medicamento:");
    if (!name) return;
    
    const dose = prompt("Dosis (ej. 500mg):") || "";
    const frequency = prompt("Frecuencia (ej. Cada 8 horas):") || "";

    const newMed = { name, dose, frequency };
    const updatedMeds = [...meds, newMed];

    try {
      await client.models.Patient.update({
        id: patient.id,
        meds: updatedMeds
      });
      setMeds(updatedMeds);
      alert('Medicamento recetado con éxito.');
    } catch (error) {
      console.error("Error al añadir medicamento:", error);
      alert('Error al recetar. Revisa si tienes permisos de DOCTOR.');
    }
  };

  return (
    <div className="workspace-grid">
      <div className="notes-container">
        <div className="notes-header">
          <FileText size={18} className="text-indigo-600" />
          <h3 className="text-sm uppercase tracking-wider">Evolución de Consulta</h3>
        </div>
        
        <textarea 
          className="notes-editor"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Escriba aquí la nota clínica..."
        />
        
        <div className="notes-footer">
          <p className="status-label">
            {isSaving ? 'Guardando...' : 'Listo para guardar'}
          </p>
          <button 
            className="btn-finalize" 
            onClick={handleSaveNotes}
            disabled={isSaving}
          >
            Finalizar
          </button>
        </div>
      </div>

      <div className="meds-container">
        <h3 className="section-label mb-4">
          <Pill size={14} className="text-purple-600" /> Medicación Actual
        </h3>
        
        <div className="space-y-2">
          {meds.length > 0 ? (
            meds.map((med, idx) => (
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
          
          <button className="btn-add-med" onClick={handleAddMed}>
            + Recetar
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default ClinicalWorkspace;