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
    patientAccountId: '',
    doctorId: '',
    time: '',
    reason: '',
    hospitalId: 'HOSPITAL_ID_EJEMPLO' 
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      const [apptData, doctorData, patientData] = await Promise.all([
        client.models.Appointment.list(),
        client.models.StaffProfile.list({ filter: { role: { eq: 'DOCTOR' } } }),
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
      patientAccountId: appt.patientAccountId,
      doctorId: appt.doctorId,
      time: appt.time,
      reason: appt.reason,
      hospitalId: appt.hospitalId
    });
  };

  const handleSave = async () => {
    try {
      if (mode === 'new') {
        
        await client.models.Appointment.create({
          ...formData,
          status: 'REQUESTED'
        });
      } else {
        
        await client.models.Appointment.update({
          id: selectedAppt.id,
          ...formData
        });
      }
      alert("Cita guardada con éxito");
      fetchInitialData(); 
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleCancelAppt = async () => {
    if (!selectedAppt) return;
    try {
      await client.models.Appointment.update({
        id: selectedAppt.id,
        status: 'CANCELLED' 
      });
      alert("Cita cancelada");
      fetchInitialData();
    } catch (error) {
      console.error("Error al cancelar:", error);
    }
  };

  if (loading) return <div>Cargando sistema de gestión...</div>;

  return (
    <div className="secretary-workspace">
      <aside className="secretary-sidebar">
        <h3>Gestión de Citas (Hospital)</h3>
        <ul>
          {appointments.map(appt => (
            <li key={appt.id} onClick={() => handleSelectAppt(appt)}>
              📅 {appt.time} - {appt.status}
            </li>
          ))}
        </ul>
        <button 
          className="new-appt-btn" 
          onClick={() => { setMode('new'); setFormData({ patientAccountId: '', doctorId: '', time: '', reason: '', hospitalId: 'HOSPITAL_ID_EJEMPLO' }); }}
        >
          + Nueva Cita
        </button>
      </aside>

      <main className="secretary-content">
        <h2>{mode === 'new' ? 'Agendar Nueva Cita' : 'Modificar Cita'}</h2>
        
        <div className="form-group">
          <label>Paciente:</label>
          <select 
            value={formData.patientAccountId} 
            onChange={(e) => setFormData({...formData, patientAccountId: e.target.value})}
          >
            <option value="">Seleccione un paciente</option>
            {patients.map(p => (
              <option key={p.id} value={p.patientAccountId}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Doctor Asignado:</label>
          <select 
            value={formData.doctorId} 
            onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
          >
            <option value="">Seleccione un doctor</option>
            {doctors.map(d => (
              <option key={d.id} value={d.userId}>{d.userId} (ID)</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Fecha y Hora:</label>
          <input 
            type="datetime-local" 
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Motivo:</label>
          <input 
            type="text" 
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
          />
        </div>

        <div className="actions">
          <button className="btn-confirm" onClick={handleSave}>
            {mode === 'new' ? 'Crear Cita' : 'Guardar Cambios'}
          </button>
          {mode === 'edit' && (
            <button className="btn-cancel" onClick={handleCancelAppt}>Cancelar Cita</button>
          )}
        </div>
      </main>
    </div>
  );
}