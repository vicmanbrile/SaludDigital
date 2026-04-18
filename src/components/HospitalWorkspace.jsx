import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import './HospitalWorkspace.css';

Amplify.configure(outputs);
const client = generateClient();

export default function HospitalWorkspace() {
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const fetchHospitalData = async () => {
    try {
      setLoading(true);
      
      const session = await fetchAuthSession();
      const userSub = session.tokens?.accessToken?.payload?.sub;
      
      if (!userSub) {
        console.error("No se encontró el ID de sesión del usuario.");
        return;
      }

      const { data: hospital } = await client.models.Hospital.get({ id: userSub });
      setHospitalInfo(hospital);

      const { data: doctors } = await client.models.Doctor.list({
        filter: { hospitalId: { eq: userSub } }
      });

      const { data: secretaries } = await client.models.Secretary.list({
        filter: { hospitalId: { eq: userSub } }
      });

      const combinedStaff = [
        ...doctors.map(d => ({ ...d, role: 'DOCTOR' })),
        ...secretaries.map(s => ({ ...s, role: 'SECRETARIA' }))
      ];

      setStaff(combinedStaff);
    } catch (error) {
      console.error("Error al cargar los datos del hospital:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStaffStatus = async (member) => {
    try {
      const newStatus = !member.isActive;
      
      if (member.role === 'DOCTOR') {
        await client.models.Doctor.update({ id: member.id, isActive: newStatus });
      } else {
        await client.models.Secretary.update({ id: member.id, isActive: newStatus });
      }
      
      fetchHospitalData();
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
        <div>
          <h1>Panel de Administración: {hospitalInfo?.name || 'Hospital'}</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>
            {hospitalInfo?.address} | 📞 {hospitalInfo?.phone}
          </p>
        </div>
        
        <div className="stats-cards">
          <div className="card">
            <h4>Total Personal</h4>
            <p>{staff.length}</p>
          </div>
          <div className="card">
            <h4>Doctores</h4>
            <p>{staff.filter(s => s.role === 'DOCTOR').length}</p>
          </div>
          <div className="card">
            <h4>Secretarias</h4>
            <p>{staff.filter(s => s.role === 'SECRETARIA').length}</p>
          </div>
        </div>
      </header>

      <section className="staff-management">
        <div className="table-controls">
          <h3>Directorio del Personal</h3>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">Todos</option>
            <option value="DOCTOR">Doctores</option>
            <option value="SECRETARIA">Secretarias</option>
          </select>
        </div>

        <table className="staff-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol / Especialidad</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((member) => (
              <tr key={member.id}>
                <td><strong>{member.name}</strong></td>
                <td>{member.email}</td>
                <td>
                  <span className={`badge ${member.role.toLowerCase()}`}>{member.role}</span>
                  {member.specialty && (
                    <span style={{ display: 'block', fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                      {member.specialty}
                    </span>
                  )}
                </td>
                <td>{member.phone}</td>
                <td>
                  <span style={{ 
                    color: member.isActive ? '#15803d' : '#b91c1c', 
                    fontWeight: 'bold',
                    backgroundColor: member.isActive ? '#dcfce7' : '#fee2e2',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {member.isActive ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                </td>
                <td>
                  <button 
                    className={member.isActive ? "delete-btn" : "approve-btn"}
                    onClick={() => toggleStaffStatus(member)}
                    style={{ margin: 0 }}
                  >
                    {member.isActive ? 'Suspender' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No se encontró personal para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}