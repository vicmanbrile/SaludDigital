import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import './PatientWorkspace.css';

const client = generateClient();

export default function PatientWorkspace() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Nuevos estados para datos médicos y doctores
  const [patientProfile, setPatientProfile] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);

  useEffect(() => {
    // 1. Suscripción a Citas
    const subAppointments = client.models.Appointment.observeQuery().subscribe({
      next: (data) => {
        const sorted = data.items.sort((a, b) => new Date(b.time) - new Date(a.time));
        setAppointments(sorted);
        if (sorted.length > 0 && !selectedAppt) setSelectedAppt(sorted[0]);
        setIsLoading(false);
      },
      error: (err) => console.error('Error en citas:', err)
    });

    // 2. Obtener Perfil del Paciente (Datos Médicos)
    const subProfile = client.models.Patient.observeQuery().subscribe({
      next: (data) => {
        if (data.items.length > 0) setPatientProfile(data.items[0]);
      },
      error: (err) => console.error('Error en perfil:', err)
    });

    // 3. Obtener lista de Doctores disponibles
    const fetchDoctors = async () => {
      try {
        const { data } = await client.models.StaffProfile.list({
          filter: { role: { eq: 'DOCTOR' } }
        });
        setAvailableDoctors(data);
      } catch (err) {
        console.error('Error al cargar doctores:', err);
      }
    };

    fetchDoctors();
    return () => {
      subAppointments.unsubscribe();
      subProfile.unsubscribe();
    };
  }, [selectedAppt]);

  const handleRequestDoctor = async (doctorId) => {
    if (!patientProfile || !doctorId) return;
    try {
      await client.models.Patient.update({
        id: patientProfile.id,
        doctorId: doctorId,
        doctorStatus: 'PENDING'
      });
      alert('Solicitud enviada al doctor correctamente.');
    } catch (err) {
      console.error('Error al solicitar doctor:', err);
      alert('No se pudo enviar la solicitud.');
    }
  };

  if (isLoading) {
    return <div className="patient-workspace"><p>Cargando información...</p></div>;
  }

  return (
    <div className="patient-workspace">
      <aside className="patient-sidebar">
        <h3>Mis Citas</h3>
        <ul>
          {appointments.length === 0 ? (
            <li className="empty-list">No tienes citas programadas.</li>
          ) : (
            appointments.map((appt) => (
              <li 
                key={appt.id} 
                className={selectedAppt?.id === appt.id ? 'active' : ''}
                onClick={() => setSelectedAppt(appt)}
              >
                <div className="appt-date">{new Date(appt.time).toLocaleString()}</div>
                <div className="appt-doc">ID Doctor: {appt.doctorId}</div>
              </li>
            ))
          )}
        </ul>

        <hr />
        
        <div className="doctor-selection">
          <h3>Solicitar Doctor</h3>
          <select 
            className="doctor-select"
            onChange={(e) => handleRequestDoctor(e.target.value)}
            value={patientProfile?.doctorId || ""}
          >
            <option value="">Seleccionar un doctor...</option>
            {availableDoctors.map(doc => (
              <option key={doc.id} value={doc.userId}>
                {doc.userId} - {doc.hospitalId}
              </option>
            ))}
          </select>
          {patientProfile?.doctorStatus && (
            <p className="status-tag">Estado: {patientProfile.doctorStatus}</p>
          )}
        </div>
      </aside>

      <main className="patient-content">
        {/* Sección de Datos Médicos */}
        <section className="medical-data-card">
          <h2>Mi Perfil Médico</h2>
          {patientProfile ? (
            <div className="appt-card">
              <p><strong>Nombre:</strong> {patientProfile.name}</p>
              <p><strong>Edad:</strong> {patientProfile.age} años</p>
              <p><strong>Notas Clínicas:</strong> {patientProfile.clinicalNotes || 'Sin notas registradas.'}</p>
              <h4>Medicamentos Actuales:</h4>
              {patientProfile.meds && patientProfile.meds.length > 0 ? (
                <ul>
                  {patientProfile.meds.map((m, i) => (
                    <li key={i}>{m.name} - {m.dose} ({m.frequency})</li>
                  ))}
                </ul>
              ) : <p>No hay medicamentos recetados.</p>}
            </div>
          ) : (
            <p>No se encontró perfil médico activo.</p>
          )}
        </section>

        {/* Detalle de Cita Seleccionada */}
        <section className="appointment-detail">
          <h2>Detalle de la Cita</h2>
          {selectedAppt ? (
            <div className="appt-card">
              <p><strong>Fecha:</strong> {new Date(selectedAppt.time).toLocaleString()}</p>
              <p><strong>Hospital:</strong> {selectedAppt.hospitalId}</p>
              <p><strong>Estado:</strong> {selectedAppt.status}</p>
              <hr />
              <p><strong>Motivo:</strong> {selectedAppt.reason || 'No especificado'}</p>
            </div>
          ) : (
            <p>Selecciona una cita para ver los detalles.</p>
          )}
        </section>
      </main>
    </div>
  );
}