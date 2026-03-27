import React, { useState, useEffect } from 'react';

import { generateClient } from 'aws-amplify/data';
import './PatientWorkspace.css';

const client = generateClient();
export default function PatientWorkspace() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const subscription = client.models.Appointment.observeQuery().subscribe({
      next: (data) => {
        const sortedAppointments = data.items.sort((a, b) => 
          new Date(b.time) - new Date(a.time)
        );
        setAppointments(sortedAppointments);
        if (sortedAppointments.length > 0 && !selectedAppt) {
          setSelectedAppt(sortedAppointments[0]);
        }
        setIsLoading(false);
      },
      error: (err) => {
        console.error('Error al obtener las citas:', err);
        setIsLoading(false);
      }
    });    
    return () => subscription.unsubscribe();
  }, [selectedAppt]); 

  
  if (isLoading) {
    return <div className="patient-workspace"><p style={{padding: '20px'}}>Cargando tus citas médicas...</p></div>;
  }

  return (
    <div className="patient-workspace">
      {}
      <aside className="patient-sidebar">
        <h3>Mis Citas</h3>
        <ul>
          {appointments.length === 0 ? (
            <li style={{ pointerEvents: 'none', color: '#949ba4' }}>No tienes citas programadas.</li>
          ) : (
            appointments.map((appt) => {
              
              const dateObj = new Date(appt.time);
              const formattedDate = isNaN(dateObj) ? appt.time : dateObj.toLocaleString();

              return (
                <li 
                  key={appt.id} 
                  className={selectedAppt?.id === appt.id ? 'active' : ''}
                  onClick={() => setSelectedAppt(appt)}
                >
                  <div className="appt-date">{formattedDate}</div>
                  <div className="appt-doc">Doctor ID: {appt.doctorId}</div>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      {}
      <main className="patient-content">
        <h2>Detalle de la Cita</h2>
        {selectedAppt ? (
          <div className="appt-card">
            <p><strong>Fecha:</strong> {new Date(selectedAppt.time).toLocaleString()}</p>
            {}
            <p><strong>Doctor Asignado:</strong> {selectedAppt.doctorId}</p>
            <p><strong>Hospital:</strong> {selectedAppt.hospitalId}</p>
            <p><strong>Estado:</strong> {selectedAppt.status === 'REQUESTED' ? 'Pendiente' : selectedAppt.status === 'CONFIRMED' ? 'Confirmada' : 'Cancelada'}</p>
            
            <hr />

            <div className="medical-results">
              <h3>Motivo de consulta</h3>
              <p>{selectedAppt.reason || 'No se especificó un motivo.'}</p>
              
              {}
              {selectedAppt.status === 'CONFIRMED' ? (
                <div className="future-appt">
                  <p>¡Tu cita está confirmada! Te esperamos en la fecha y hora indicadas.</p>
                </div>
              ) : selectedAppt.status === 'REQUESTED' ? (
                <div className="future-appt" style={{backgroundColor: '#eef2ff', color: '#3730a3'}}>
                  <p>Tu cita está en espera de ser confirmada por la secretaria o el hospital.</p>
                </div>
              ) : (
                <div className="future-appt" style={{backgroundColor: '#fef2f2', color: '#991b1b'}}>
                  <p>Esta cita ha sido cancelada.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p>Selecciona una cita de la izquierda o solicita una nueva.</p>
        )}
      </main>
    </div>
  );
}