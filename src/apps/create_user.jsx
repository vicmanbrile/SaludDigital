
import React, { useState } from "react";
import { generateClient } from "aws-amplify/api";
import "./index.css";

const client = generateClient();

export default function CreateUser() {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [grupo, setGrupo] = useState("PACIENTE");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const { data, errors } = await client.mutations.Usuario({
        email,
        nombre,
        grupo,
      }, {
        authMode: "apiKey"
      });

      if (errors) {
        setMensaje("Error: " + errors[0].message);
      } else {
        setMensaje("Usuario creado: " + data.message);
      }
    } catch (err) {
      setMensaje("Error de red o permisos.");
    }
  };

  return (
    <div className="container">
      <h1>Registrar Nuevo Usuario</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="text" placeholder="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <select value={grupo} onChange={(e) => setGrupo(e.target.value)}>
          <option value="PACIENTE">Paciente</option>
          <option value="DOCTOR">Doctor</option>
          <option value="SECRETARIA">Secretaria</option>
        </select>
        <button type="submit">Crear Cuenta</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}