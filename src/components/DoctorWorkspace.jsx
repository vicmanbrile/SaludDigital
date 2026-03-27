import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json'; 
import './DoctorWorkspace.css';


Amplify.configure(outputs);
const client = generateClient();

export default function DoctorWorkspace() {
  const [appointments, setAppointments] = useState([]);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        const { data: items } = await client.models.Appointment.list();
        setAppointments(items);
        
        if (items.length > 0) {
          setActiveAppointment(items[0]);
        }
      } catch (error) {
        console.error("Error al obtener las citas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) return <div className="loading">Cargando agenda...</div>;

  return (
    <div className="doctor-workspace">
      <aside className="doctor-sidebar">
        <h3>Citas de Hoy</h3>
        <ul>
          {appointments.map(appt => (
            <li 
              key={appt.id} 
              className={activeAppointment?.id === appt.id ? 'active' : ''}
              onClick={() => setActiveAppointment(appt)}
            >
              {}
              <strong>{appt.time || 'Sin hora'}</strong> - ID: {appt.patientAccountId}
            </li>
          ))}
        </ul>
      </aside>

      <main className="doctor-content">
        {activeAppointment ? (
          <div className="patient-file">
            <h2>Expediente del Paciente: {activeAppointment.patientAccountId}</h2>
            <p><strong>Motivo de consulta:</strong> {activeAppointment.reason}</p>
            <p><strong>Estado:</strong> {activeAppointment.status}</p>
            
            <div className="clinical-notes-form">
              <h3>Notas Clínicas (editable por el Doctor)</h3>
              <textarea 
                placeholder="Escriba el diagnóstico y observaciones aquí..."
                defaultValue={activeAppointment.reason} 
              ></textarea>
              
              <h3>Receta Médica</h3>
              <textarea placeholder="Medicamentos y dosis..."></textarea>
              
              <button className="save-btn">Guardar Expediente</button>
            </div>
          </div>
        ) : (
          <h2>Seleccione una cita de su lista</h2>
        )}
      </main>
    </div>
  );
}