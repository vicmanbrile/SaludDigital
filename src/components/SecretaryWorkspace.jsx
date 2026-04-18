import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import './SecretaryWorkspace.css';

Amplify.configure(outputs);
const client = generateClient();

export default function SecretaryWorkspace() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null); 
  const [mode, setMode] = useState('new'); 
  const [loading, setLoading] = useState(true);

  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    scheduledAt: '',
    reason: '',
    hospitalId: '' 
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      const [apptData, doctorData, patientData] = await Promise.all([
        client.models.Appointment.list(),
        
        client.models.Doctor.list(),
        client.models.Patient.list()
      ]);

      setAppointments(apptData.data);
      setDoctors(doctorData.data);
      setPatients(patientData.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAppt = (appt) => {
    setMode('edit');
    setSelectedAppt(appt);
    setFormData({
      patientId: appt.patientId,
      doctorId: appt.doctorId,
      
      scheduledAt: appt.scheduledAt ? appt.scheduledAt.substring(0, 16) : '',
      reason: appt.reason || '',
      hospitalId: appt.hospitalId
    });
  };

  const handleSave = async () => {
    try {
      
      if (!formData.hospitalId && mode === 'new') {
         alert("Error: ID de Hospital es necesario");
         return;
      }

      if (mode === 'new') {
        await client.models.Appointment.create({
          ...formData,
          
          status: 'PENDING',
          createdByRole: 'SECRETARIA'
        });
      } else {
        
        await client.models.Appointment.update({
          id: selectedAppt.id,
          patientId: formData.patientId,
          doctorId: formData.doctorId,
          scheduledAt: formData.scheduledAt,
          reason: formData.reason,
          hospitalId: formData.hospitalId
        });
      }
      alert("Cita guardada con éxito");
      setMode('new');
      fetchInitialData(); 
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar los cambios");
    }
  };

  const updateStatus = async (newStatus) => {
    if (!selectedAppt) return;
    try {
      await client.models.Appointment.update({
        id: selectedAppt.id,
        status: newStatus
      });
      fetchInitialData();
      setMode('new');
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) return <div className="loading-state">Cargando panel de gestión...</div>;

  return (
    <div className="secretary-container">
      <aside className="appt-list-sidebar">
        <div className="sidebar-header">
          <h3>Agenda de Citas</h3>
          <button className="btn-refresh" onClick={fetchInitialData}>Actualizar</button>
        </div>
        <div className="scroll-area">
          {appointments.sort((a,b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)).map(appt => (
            <div 
              key={appt.id} 
              className={`appt-item-card ${selectedAppt?.id === appt.id ? 'active' : ''} ${appt.status.toLowerCase()}`}
              onClick={() => handleSelectAppt(appt)}
            >
              <div className="appt-info">
                <span className="appt-date">{new Date(appt.scheduledAt).toLocaleString()}</span>
                <span className="appt-status-tag">{appt.status}</span>
              </div>
              <p className="appt-patient-name">Paciente ID: {appt.patientId.substring(0,8)}...</p>
            </div>
          ))}
        </div>
        <button 
          className="btn-primary full-width" 
          onClick={() => { setMode('new'); setSelectedAppt(null); }}
        >
          + Nueva Cita
        </button>
      </aside>

      <main className="editor-panel">
        <div className="panel-card">
          <h2>{mode === 'new' ? 'Nueva Cita Médica' : 'Detalles de la Cita'}</h2>
          
          <div className="grid-form">
            <div className="input-group">
              <label>Paciente</label>
              <select 
                value={formData.patientId} 
                onChange={(e) => setFormData({...formData, patientId: e.target.value})}
              >
                <option value="">Seleccione paciente...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Doctor Asignado</label>
              <select 
                value={formData.doctorId} 
                onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
              >
                <option value="">Seleccione doctor...</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Fecha y Hora</label>
              <input 
                type="datetime-local" 
                value={formData.scheduledAt}
                onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
              />
            </div>

            <div className="input-group full-width">
              <label>Motivo de Consulta</label>
              <textarea 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Ej: Revisión anual..."
              />
            </div>
          </div>

          <div className="button-group">
            <button className="btn-save" onClick={handleSave}>
              {mode === 'new' ? 'Agendar Cita' : 'Actualizar Cita'}
            </button>
            {mode === 'edit' && (
              <>
                <button className="btn-confirm-appt" onClick={() => updateStatus('CONFIRMED')}>Confirmar</button>
                <button className="btn-cancel-appt" onClick={() => updateStatus('CANCELLED')}>Cancelar</button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}