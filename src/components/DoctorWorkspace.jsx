import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json'; 
import './DoctorWorkspace.css';

Amplify.configure(outputs);
const client = generateClient();

export default function DoctorWorkspace() {
  const [appointments, setAppointments] = useState([]);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      const session = await fetchAuthSession();
      const doctorSub = session.tokens?.idToken?.payload?.sub;

      
      const { data: items } = await client.models.Appointment.list({
        filter: { doctorId: { eq: doctorSub } }
      });

      
      const sorted = items.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
      setAppointments(sorted);
      
      if (sorted.length > 0) {
        handleSelectAppt(sorted[0]);
      }
    } catch (error) {
      console.error("Error al obtener las citas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAppt = async (appt) => {
    setActiveAppointment(appt);
    setNotes(appt.reason || "");
    
    
    try {
      const { data: patient } = await client.models.Patient.get({ id: appt.patientId });
      setPatientData(patient);
    } catch (e) {
      console.error("Error cargando paciente:", e);
    }
  };

 const handleSaveConsulation = async () => {
    if (!activeAppointment) return;

    try {
      setLoading(true); 

      
      const { data: updatedAppt, errors } = await client.models.Appointment.update({
        id: activeAppointment.id,
        
        hospitalId: activeAppointment.hospitalId, 
        reason: notes, 
        status: 'COMPLETED'
      });

      if (errors) {
        console.error("Errores de AppSync:", errors);
        alert("Error de permisos: No se pudo actualizar la cita.");
        return;
      }

      console.log("Cita actualizada con éxito:", updatedAppt);
      alert("✅ Consulta finalizada y expediente guardado.");
      
      
      await fetchDoctorAppointments();
      
    } catch (error) {
      console.error("Error crítico al guardar:", error);
      alert("Hubo un fallo en la conexión al intentar guardar.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando agenda médica...</div>;

  return (
    <div className="doctor-workspace-container">
      <aside className="doctor-sidebar">
        <div className="sidebar-header">
          <h3>Citas Programadas</h3>
          <span className="count-badge">{appointments.length}</span>
        </div>
        <ul className="appt-list">
          {appointments.map(appt => (
            <li 
              key={appt.id} 
              className={`appt-item ${activeAppointment?.id === appt.id ? 'selected' : ''} ${appt.status.toLowerCase()}`}
              onClick={() => handleSelectAppt(appt)}
            >
              <div className="appt-time">
                {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="appt-brief">
                <span className="patient-id">ID: {appt.patientId.substring(0, 8)}</span>
                <span className="status-indicator">{appt.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <main className="doctor-main-content">
        {activeAppointment ? (
          <div className="patient-file-card">
            <header className="file-header">
              <div className="patient-info">
                <h2>{patientData?.name || 'Cargando...'}</h2>
                <div className="vital-tags">
                  <span className="tag blood">Tipo: {patientData?.bloodType || 'N/A'}</span>
                  {patientData?.allergies && (
                    <span className="tag allergy">⚠️ Alergias: {patientData.allergies}</span>
                  )}
                </div>
              </div>
              <div className="appt-meta">
                <span>Fecha: {new Date(activeAppointment.scheduledAt).toLocaleDateString()}</span>
                <span className={`status-pill ${activeAppointment.status.toLowerCase()}`}>
                  {activeAppointment.status}
                </span>
              </div>
            </header>

            <div className="clinical-area">
              <div className="input-section">
                <label>Notas Clínicas y Diagnóstico</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describa los síntomas, hallazgos y diagnóstico..."
                ></textarea>
              </div>

              <div className="input-section">
                <label>Tratamiento / Receta</label>
                <textarea 
                  placeholder="Medicamentos, dosis y duración del tratamiento..."
                ></textarea>
              </div>

              <div className="form-actions">
                <button 
                  className="btn-complete" 
                  onClick={handleSaveConsulation}
                  disabled={activeAppointment.status === 'COMPLETED'}
                >
                  {activeAppointment.status === 'COMPLETED' ? 'Consulta Finalizada' : 'Finalizar Consulta'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Seleccione un paciente de la lista para comenzar la consulta.</p>
          </div>
        )}
      </main>
    </div>
  );
}