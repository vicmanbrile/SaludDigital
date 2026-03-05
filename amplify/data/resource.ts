import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Patient: a.model({
    id: a.id().required(),
    name: a.string().required(),
    age: a.integer(),
    clinicalNotes: a.string(), 
    hospitalId: a.id(),
  }).authorization((allow) => [
    // El administrador del Hospital gestiona todo su centro
    allow.group("HOSPITAL").to(['create', 'read', 'update', 'delete']),
    // El Doctor lee y edita datos clínicos
    allow.group("DOCTOR").to(['read', 'update']),
    // La Secretaria solo registra y ve datos básicos (No clinicalNotes)
    allow.group("SECRETARIA").to(['read', 'create']),
    // El Paciente solo lee su propia ficha
    allow.owner(),
  ]),

  Appointment: a.model({
    time: a.string(),
    reason: a.string(),
    status: a.string(),
    patientId: a.id(),
  }).authorization((allow) => [
    allow.groups(["DOCTOR", "SECRETARIA", "HOSPITAL"]).to(['read', 'create', 'update']),
    allow.owner()
  ])
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ schema });