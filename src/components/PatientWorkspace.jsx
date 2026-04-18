import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import './PatientWorkspace.css';

Amplify.configure(outputs);
const client = generateClient();

export default function PatientWorkspace() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  
  const [viewingSchedule, setViewingSchedule] = useState(null);

  useEffect(() => {
    initPatientData();
  }, []);

  const initPatientData = async () => {
    try {
      setIsLoading(true);
      const session = await fetchAuthSession();
      const userSub = session.tokens?.idToken?.payload?.sub;

      if (!userSub) return;

      const { data: profiles } = await client.models.Patient.list({
        filter: { patientAccountId: { eq: userSub } }
      });
      if (profiles.length > 0) setPatientProfile(profiles[0]);

      const { data: appts } = await client.models.Appointment.list({
        filter: { patientId: { eq: userSub } }
      });
      const sorted = appts.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
      setAppointments(sorted);
      if (sorted.length > 0) setSelectedAppt(sorted[0]);

      const { data: doctors } = await client.models.Doctor.list({
        filter: { isActive: { eq: true } }
      });
      setAvailableDoctors(doctors);

    } catch (err) {
      console.error('Error inicializando datos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  
  const renderSchedule = (schedule) => {
    if (!schedule) return "No hay horarios disponibles.";
    
    
    let scheduleObj = schedule;
    if (typeof schedule === 'string') {
      try { scheduleObj = JSON.parse(schedule); } catch (e) { return schedule; }
    }

    const dayNames = { MON: 'Lun', TUE: 'Mar', WED: 'Mié', THU: 'Jue', FRI: 'Vie', SAT: 'Sáb', SUN: 'Dom' };

    return (
      <div className="schedule-viewer">
        {Object.entries(scheduleObj).map(([day, hours]) => (
          <div key={day} className="day-row">
            <strong>{dayNames[day] || day}:</strong>
            <div className="hours-grid">
              {Array.isArray(hours) ? hours.map(h => <span key={h} className="hour-tag">{h}</span>) : hours}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) return <div className="loading-screen">Cargando...</div>;

  return (
    <div className="patient-container">
      <aside className="patient-sidebar">
        <div className="sidebar-header"><h3>Mis Citas</h3></div>
        <div className="appt-list">
          {appointments.map((appt) => (
            <div key={appt.id} className={`appt-item ${selectedAppt?.id === appt.id ? 'active' : ''}`} onClick={() => setSelectedAppt(appt)}>
              <span className="date">{new Date(appt.scheduledAt).toLocaleDateString()}</span>
              <span className={`status-pill ${appt.status.toLowerCase()}`}>{appt.status}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="patient-main">
        <div className="dashboard-grid">
          
          <section className="profile-card">
            <div className="card-header"><h2>Mi Perfil Médico</h2></div>
            {patientProfile && (
              <div className="profile-details">
                <p><strong>{patientProfile.name}</strong></p>
                <div className="vital-grid">
                  <div className="vital-item"><label>Sangre</label><div className="value">{patientProfile.bloodType}</div></div>
                  <div className="vital-item"><label>Alergias</label><div className="value alert">{patientProfile.allergies || 'Ninguna'}</div></div>
                </div>
              </div>
            )}
          </section>

          <section className="detail-card">
            <div className="card-header"><h2>Detalle de Cita</h2></div>
            {selectedAppt ? (
              <div className="appt-detail-content">
                <p><strong>Fecha:</strong> {new Date(selectedAppt.scheduledAt).toLocaleString()}</p>
                <p className="reason-text">{selectedAppt.reason}</p>
              </div>
            ) : <p>Selecciona una cita.</p>}
          </section>

          <section className="doctors-card full-width">
            <div className="card-header"><h2>Directorio Médico y Horarios</h2></div>
            <div className="doctors-layout">
              <div className="doctors-list">
                {availableDoctors.map(doc => (
                  <div key={doc.id} className={`doc-entry ${viewingSchedule?.id === doc.id ? 'active' : ''}`}>
                    <div>
                      <strong>{doc.name}</strong>
                      <span className="specialty">{doc.specialty}</span>
                    </div>
                    <button className="btn-contact" onClick={() => setViewingSchedule(doc)}>
                      {viewingSchedule?.id === doc.id ? 'Viendo...' : 'Ver horarios'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="schedule-panel">
                {viewingSchedule ? (
                  <>
                    <h3>Disponibilidad de {viewingSchedule.name}</h3>
                    {renderSchedule(viewingSchedule.weeklySchedule)}
                  </>
                ) : (
                  <p className="hint">Haz clic en "Ver horarios" de un doctor para ver su disponibilidad.</p>
                )}
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}