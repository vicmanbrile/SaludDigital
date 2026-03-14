import React, { useState, useMemo, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import outputs from '../../amplify_outputs.json';
import { Activity } from 'lucide-react';


import SignCard from '../components/SignCard';
import IconSidebar from '../components/IconSideBar';
import PatientDrawer from '../components/PatientDrawer';
import ClinicalWorkspace from '../components/ClinicalWorkspace';
import './index.css';

Amplify.configure(outputs);
const client = generateClient();

const AppContent = ({ user, signOut }) => {
  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRightDrawer, setShowRightDrawer] = useState(false);
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
    try {
      const { data: patients, errors } = await client.models.Patient.list();
        if (errors) {
          console.error("Errores de AppSync:", errors);
            return;
          }
          console.log("Pacientes recuperados:", patients);
          // Aquí actualizas tu estado (useState) con 'patients'
          setPatients(patients);
      } catch (error) {
            console.error("Error al obtener pacientes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const activePatient = useMemo(() => {
    return patients.find(p => p.id === selectedId) || patients[0];
  }, [selectedId, patients]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, patients]);

  if (loading) return <div className="loading-screen">Cargando expediente...</div>;

  return (
    <div className="app-viewport">
      {(showRightDrawer || showLeftDrawer) && (
        <div className="overlay-backdrop" onClick={() => { setShowRightDrawer(false); setShowLeftDrawer(false); }} />
      )}

      <PatientDrawer 
        isOpen={showLeftDrawer} 
        onClose={() => setShowLeftDrawer(false)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        patients={filteredPatients}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <IconSidebar 
        agenda={patients} 
        selectedId={selectedId} 
        onSelect={setSelectedId} 
        onOpenSearch={() => setShowLeftDrawer(true)} 
      />

      <main className="main-content">
        <header className="patient-header">
          <div className="header-container">
            <button onClick={() => setShowRightDrawer(true)} className="patient-profile-trigger">
              <div className="relative">
                <img src={activePatient?.img} className="w-12 h-12 rounded-xl object-cover" alt="" />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${activePatient?.statusColor || 'bg-slate-300'}`} />
              </div>
              <div>
                <h1 className="text-xl font-black">{activePatient?.name || 'Seleccione Paciente'}</h1>
                <p className="text-slate-400 text-[10px] font-bold uppercase">{activePatient?.age} años • {activePatient?.reason}</p>
              </div>
            </button>
            <button onClick={signOut} className="p-2 bg-slate-100 rounded-lg hover:text-red-500">Salir</button>
          </div>
        </header>

        <div className="content-scroll-area">
          <section>
            <div className="vitals-grid">
              <SignCard label="Peso" value={activePatient?.vitals?.weight} colorClass="bg-emerald-500" icon={Activity} />
              <SignCard label="Presión" value={activePatient?.vitals?.bp} colorClass="bg-rose-500" icon={Activity} />
            </div>
          </section>
          {activePatient ? (
            <ClinicalWorkspace key={activePatient.id} patient={activePatient} />
          ) : (
            <div className="p-10 text-center text-slate-400">No hay datos disponibles</div>
          )}
        </div>
      </main>
    </div>
  );
};


const App = () => {
  return (
    <Authenticator>
      {(props) => <AppContent {...props} />}
    </Authenticator>
  );
};

export default App;