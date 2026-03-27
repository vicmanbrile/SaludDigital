import React, { useState } from 'react';
import { signUp } from 'aws-amplify/auth';
import './RegistrarHospital.css';

export default function RegisterHospital() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    hospitalName: ''
  });
  const [isSignedUp, setIsSignedUp] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signUp({
        username: formData.email,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
            name: formData.hospitalName,
            'custom:rol': 'HOSPITAL' 
          }
        }
      });
      setIsSignedUp(true);
      alert("¡Registro exitoso! Por favor revisa tu correo para confirmar.");
    } catch (error) {
      console.error("Error al registrar hospital:", error);
      alert(error.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Registro de Nuevo Hospital</h2>
      <form onSubmit={handleSignUp}>
        <input 
          type="text" 
          placeholder="Nombre del Hospital" 
          onChange={e => setFormData({...formData, hospitalName: e.target.value})} 
          required 
        />
        <input 
          type="email" 
          placeholder="Correo Administrativo" 
          onChange={e => setFormData({...formData, email: e.target.value})} 
          required 
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          onChange={e => setFormData({...formData, password: e.target.value})} 
          required 
        />
        <button type="submit">Registrar Hospital</button>
      </form>
    </div>
  );
}