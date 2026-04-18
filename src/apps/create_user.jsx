import React, { useState } from "react";
import { generateClient } from "aws-amplify/data"; 
import "./create_user.css";

const client = generateClient();

export default function CreateUser() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    rol: "PACIENTE",
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ text: "", type: "" });

    try {
      
      const { data: newPatient, errors } = await client.models.Patient.create({
        name: formData.name,
        email: formData.email,
        phone: "Sin asignar", 
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      setMensaje({ text: `¡Usuario ${newPatient.name} registrado con éxito!`, type: "success" });
      setFormData({ email: "", name: "", rol: "PACIENTE" });
    } catch (err) {
      setMensaje({ text: "Error: " + err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-card">
      <div className="card-header">
        <h2>Registro de Usuario</h2>
        <p>Plataforma Hospitalaria</p>
      </div>

      <form onSubmit={handleSubmit} className="styled-form">
        <div className="input-group">
          <label>Nombre Completo</label>
          <input
            name="name"
            type="text"
            placeholder="Ej. Juan Pérez"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Correo Electrónico</label>
          <input
            name="email"
            type="email"
            placeholder="usuario@correo.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Rol del Sistema</label>
          <select name="rol" value={formData.rol} onChange={handleChange}>
            <option value="PACIENTE">Paciente</option>
            <option value="DOCTOR">Doctor</option>
            <option value="SECRETARIA">Secretaria</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Procesando..." : "Crear Cuenta"}
        </button>
      </form>

      {mensaje.text && (
        <div className={`alert ${mensaje.type}`}>
          {mensaje.text}
        </div>
      )}
    </div>
  );
}