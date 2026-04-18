import React, { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator, View, Heading, useTheme, Text } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';

import outputs from '../../amplify_outputs.json';

import '@aws-amplify/ui-react/styles.css';
import './index.css';

import PatientWorkspace from '../components/PatientWorkspace';
import DoctorWorkspace from '../components/DoctorWorkspace';
import SecretaryWorkspace from '../components/SecretaryWorkspace';
import HospitalWorkspace from '../components/HospitalWorkspace';

Amplify.configure(outputs);


const formComponents = {
  Header() {
    const { tokens } = useTheme();
    return (
      <View textAlign="center" padding={`${tokens.space.large} ${tokens.space.large} 0 ${tokens.space.large}`}>
        <Heading level={3} style={{ marginBottom: '10px', color: '#0f172a' }}>
          SaludDigital
        </Heading>
        <Text style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>
          Inicia sesión para acceder a tu entorno seguro
        </Text>
      </View>
    );
  },
};


export default function App() {
  return (
    <Authenticator hideSignUp={true} components={formComponents}>
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <h2 style={{ color: '#475569' }}>Cargando entorno seguro...</h2>
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
    <div className="app-container" style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '15px 30px', 
        backgroundColor: '#0f172a', 
        color: 'white',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>SaludDigital — Portal {userRole}</div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            Sesión iniciada: {user?.signInDetails?.loginId || 'Usuario'}
          </span>
          <button 
            onClick={signOut}
            style={{ 
              padding: '6px 12px', 
              cursor: 'pointer', 
              background: '#ef4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#dc2626'}
            onMouseOut={(e) => e.target.style.background = '#ef4444'}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main style={{ flex: 1, overflow: 'auto', backgroundColor: '#f1f5f9' }}>
        {renderWorkspace()}
      </main>
    </div>
  );
}