// seed.ts
import { generateClient } from 'aws-amplify/data';
import type { Schema } from './amplify/data/resource';
import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json';

// 1. Configuramos Amplify forzando el uso de la API Key para este script
Amplify.configure(outputs, {
  API: {
    GraphQL: {
      endpoint: outputs.data.url,
      region: outputs.data.aws_region,
      defaultAuthMode: 'apiKey',
      apiKey: outputs.data.api_key
    }
  }
});

// 2. Generamos el cliente especificando explícitamente el authMode
const client = generateClient<Schema>({
  authMode: 'apiKey'
});

const seed = async () => {
  // 3. Tus datos de prueba
  const patientsData = [
    { name: 'Carlos Ruiz', age: 45, notes: 'Vitals: 135/85 BP, 82kg' },
    { name: 'Elena Martínez', age: 62, notes: 'Vitals: 120/75 BP, 65kg' },
    { name: 'Jorge Sánchez', age: 28, notes: 'Temp: 38.8, 74kg' }
  ];

  console.log('⏳ Iniciando carga de datos con API KEY...');

  try {
    // 4. Recorremos el arreglo y creamos un paciente a la vez
    for (const p of patientsData) {
      const { data: newPatient, errors } = await client.models.Patient.create({
        name: p.name,
        age: p.age,
        clinicalNotes: p.notes,
      });

      if (errors) {
        console.error(`❌ Error al crear a ${p.name}:`, errors);
      } else {
        console.log(`✅ Paciente creado: ${newPatient?.name} (ID: ${newPatient?.id})`);
      }
    }
    
    console.log('🎉 ¡Carga de datos finalizada con éxito!');

  } catch (error) {
    console.error('💥 Error inesperado ejecutando el seed:', error);
  }
};

// Ejecutamos la función
seed();