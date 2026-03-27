import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { createUser } from '../functions/createUser/resource';

const schema = a.schema({
  Medication: a.customType({
    name: a.string().required(),
    dose: a.string(),
    frequency: a.string(),
  }),

  UsuarioResponse: a.customType({
    success: a.boolean(),
    message: a.string()
  }),

  StaffProfile: a.model({
    userId: a.string().required(),
    role: a.enum(['DOCTOR', 'SECRETARIA']),
    hospitalId: a.string().required(), 
    status: a.enum(['PENDING', 'CONFIRMED']),
  }).authorization((allow) => [
    allow.ownerDefinedIn('userId').to(['read', 'create']), 
    allow.group("HOSPITAL").to(['read', 'update']), 
  ]),

  Patient: a.model({
    patientAccountId: a.string().required(), 
    name: a.string().required(),
    age: a.integer(),
    clinicalNotes: a.string(),
    meds: a.ref('Medication').array(),
    hospitalId: a.string(), 
    doctorId: a.string(),   
    doctorStatus: a.enum(['PENDING', 'CONFIRMED']), 
  }).authorization((allow) => [
    allow.ownerDefinedIn('patientAccountId').to(['read', 'create', 'update']),  
    allow.group('DOCTOR').to(['read', 'update']),
    allow.group('HOSPITAL').to(['read', 'update']),
  ]),

  Appointment: a.model({
    time: a.string(),
    reason: a.string(),
    status: a.enum(['REQUESTED', 'CONFIRMED', 'CANCELLED']),
    hospitalId: a.string().required(),
    doctorId: a.string().required(),
    patientAccountId: a.string().required()
  }).authorization((allow) => [
    allow.ownerDefinedIn('patientAccountId').to(['create', 'read']),
    allow.ownerDefinedIn('doctorId').to(['read', 'update']),
    allow.group('SECRETARIA').to(['create', 'read', 'update', 'delete']),  
    allow.group('HOSPITAL').to(['read']),
    allow.group('DOCTOR').to(['read'])
  ]),

  Usuario: a
    .mutation()
    .arguments({
      email: a.string().required(),
      nombre: a.string().required(),
      grupo: a.string().required(),
      hospitalId: a.string() 
    })
    .returns(a.ref('UsuarioResponse'))
    .handler(a.handler.function(createUser))
    .authorization(allow => [
      allow.group('SECRETARIA'),
      allow.group('HOSPITAL')
    ]),
    Hospital: a.model({
    nombre: a.string().required(),
    ubicacion: a.string(),
    telefono: a.string(),
    }).authorization((allow) => [
      allow.owner().to(['read', 'update', 'delete']), 
      allow.authenticated().to(['read']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ 
  schema, 
  authorizationModes: {
    defaultAuthorizationMode : 'userPool',
  }
});