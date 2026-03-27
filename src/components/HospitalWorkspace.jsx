import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import './HospitalWorkspace.css';


Amplify.configure(outputs);
const client = generateClient();

export default function HospitalWorkspace() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      
      const { data: profiles } = await client.models.StaffProfile.list();
      setStaff(profiles);
    } catch (error) {
      console.error("Error al cargar el personal:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStaffStatus = async (id, newStatus) => {
    try {
      await client.models.StaffProfile.update({
        id: id,
        status: newStatus
      });
      fetchStaff(); 
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const filteredStaff = staff.filter(member => 
    filter === 'ALL' || member.role === filter
  );

  if (loading) return <div className="loading">Cargando panel del hospital...</div>;

  return (
    <div className="hospital-workspace">
      <header className="hospital-header">
        <h1>Panel de Administración: Hospital</h1>
        <div className="stats-cards">
          <div className="card">
            <h4>Total Personal</h4>
            <p>{staff.length}</p>
          </div>
          <div className="card">
            <h4>Pendientes</h4>
            <p>{staff.filter(s => s.status === 'PENDING').length}</p>
          </div>
        </div>
      </header>

      <section className="staff-management">
        <div className="table-controls">
          <h3>Personal del Hospital</h3>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">Todos</option>
            <option value="DOCTOR">Doctores</option>
            <option value="SECRETARIA">Secretarias</option>
          </select>
        </div>

        <table className="staff-table">
          <thead>
            <tr>
              <th>ID de Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((member) => (
              <tr key={member.id}>
                <td>{member.userId}</td>
                <td><span className={`badge ${member.role.toLowerCase()}`}>{member.role}</span></td>
                <td>
                  <span className={`status-${member.status?.toLowerCase()}`}>
                    {member.status === 'CONFIRMED' ? '✅ Confirmado' : '⏳ Pendiente'}
                  </span>
                </td>
                <td>
                  {member.status === 'PENDING' && (
                    <button 
                      className="approve-btn"
                      onClick={() => updateStaffStatus(member.id, 'CONFIRMED')}
                    >
                      Aprobar
                    </button>
                  )}
                  <button className="delete-btn">Dar de baja</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}