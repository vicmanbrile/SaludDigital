import React, { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';

import outputs from '../../amplify_outputs.json';

import '@aws-amplify/ui-react/styles.css';
import './index.css';

import PatientWorkspace from '../components/PatientWorkspace';
import DoctorWorkspace from '../components/DoctorWorkspace';
import SecretaryWorkspace from '../components/SecretaryWorkspace';
import HospitalWorkspace from '../components/HospitalWorkspace';


Amplify.configure(outputs);

export default function App() {
  return (
    
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => (
        <MainRouter signOut={signOut} user={user} />
      )}
    </Authenticator>
  );
}

function MainRouter({ signOut, user }) {
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    async function checkUserRole() {
      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken?.payload['cognito:groups'];
        if (groups && groups.length > 0) {
          setUserRole(groups[0]);
        } else {
          setUserRole('PACIENTE'); 
        }
      } catch (error) {
        console.error("Error al obtener el rol del usuario:", error);
      } finally {
        setLoadingRole(false);
      }
    }

    checkUserRole();
  }, []);

  
  if (loadingRole) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Cargando entorno seguro...</h2>
      </div>
    );
  }

  
  const renderWorkspace = () => {
    switch (userRole) {
      case 'PACIENTE':
        return <PatientWorkspace />;
      case 'DOCTOR':
        return <DoctorWorkspace />;
      case 'SECRETARIA':
        return <SecretaryWorkspace />;
      case 'HOSPITAL':
        return <HospitalWorkspace />;
      default:
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Cuenta sin rol asignado</h2>
            <p>Por favor, contacta a soporte para configurar tu cuenta.</p>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '10px 20px', 
        backgroundColor: '#1e293b', 
        color: 'white' 
      }}>
        <div style={{ fontWeight: 'bold' }}>Salud Digital - {userRole}</div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span>Hola, {user?.signInDetails?.loginId || 'Usuario'}</span>
          <button 
            onClick={signOut}
            style={{ padding: '5px 10px', cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {}
      <main style={{ height: 'calc(100vh - 40px)' }}>
        {renderWorkspace()}
      </main>
    </div>
  );
}