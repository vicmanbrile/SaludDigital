import { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs);
const client = generateClient();

export default function FormularioCrearUsuario() {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('PACIENTE');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      const { data, errors } = await client.mutations.createUser({
        email: email,
        nombre: nombre,
        grupo: grupo
      });
      if (errors) {
        throw new Error(errors[0].message);
      }
      setMensaje({ texto: 'Usuario creado y asignado al grupo exitosamente.', tipo: 'exito' });
      setEmail('');
      setNombre('');
      setGrupo('PACIENTE');
      
    } catch (error) {
      console.error("Error creando usuario:", error);
      setMensaje({ texto: error.message || 'Hubo un error al crear el usuario.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nuevo Usuario</h2>
      
      {mensaje.texto && (
        <div className={`p-3 mb-4 rounded ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
          <input 
            type="text" 
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej. Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asignar Grupo / Rol</label>
          <select 
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="PACIENTE">Paciente</option>
            <option value="DOCTOR">Doctor</option>
            <option value="SECRETARIA">Secretaria</option>
            <option value="HOSPITAL">Hospital / Admin</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={cargando}
          className={`w-full text-white font-bold py-2 px-4 rounded transition-colors ${cargando ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {cargando ? 'Creando...' : 'Crear Usuario'}
        </button>
      </form>
    </div>
  );
}