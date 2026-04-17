import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Hospital: a
    .model({
      id: a.id().required(),
      name: a.string().required(),
      adminEmail: a.email().required(),
      phone: a.string(),
      address: a.string(),
      logoUrl: a.url(),

      doctors: a.hasMany('Doctor', 'hospitalId'),
      secretaries: a.hasMany('Secretary', 'hospitalId'),
    })
    .authorization((allow) => [
      allow.groups(['HOSPITAL']).to(['read', 'update']),
      allow.groups(['DOCTOR', 'SECRETARIA']).to(['read']),
      allow.groups(['PACIENTE']).to(['read']),
    ]),

  Doctor: a
    .model({
      id: a.id().required(),
      cognitoUserId: a.string().required(),   // sub del usuario en Cognito
      hospitalId: a.id().required(),
      name: a.string().required(),
      email: a.email().required(),
      specialty: a.string().required(),
      phone: a.string(),
      avatarUrl: a.url(),
      isActive: a.boolean().default(true),

      weeklySchedule: a.json(),
      hospital: a.belongsTo('Hospital', 'hospitalId'),
      appointments: a.hasMany('Appointment', 'doctorId'),
      patientLinks: a.hasMany('PatientDoctor', 'doctorId'),
    })
    .authorization((allow) => [
      allow.groups(['HOSPITAL']).to(['create', 'read', 'update', 'delete']),
      allow.groups(['DOCTOR']).to(['read', 'update']),
      allow.groups(['SECRETARIA']).to(['read']),
      allow.groups(['PACIENTE']).to(['read']),
    ]),

  Secretary: a
    .model({
      id: a.id().required(),
      cognitoUserId: a.string().required(),
      hospitalId: a.id().required(),
      name: a.string().required(),
      email: a.email().required(),
      phone: a.string(),
      isActive: a.boolean().default(true),

      // Relaciones
      hospital: a.belongsTo('Hospital', 'hospitalId'),
    })
    .authorization((allow) => [
      allow.groups(['HOSPITAL']).to(['create', 'read', 'update', 'delete']),
      allow.groups(['SECRETARIA']).to(['read', 'update']),
      allow.groups(['DOCTOR']).to(['read']),
    ]),
  Patient: a
    .model({
      patientAccountId: a.id().required(),  
      name: a.string().required(),
      email: a.email(),
      phone: a.string(),
      dateOfBirth: a.date(),
      bloodType: a.string(),
      allergies: a.string(),
      notes: a.string(),

      // Relaciones
      appointments: a.hasMany('Appointment', 'patientId'),
      doctorLinks: a.hasMany('PatientDoctor', 'patientId'),
    })
    .authorization((allow) => [
      allow.owner().identityClaim('sub').to(['read', 'update']),
      allow.groups(['DOCTOR']).to(['read']),
      allow.groups(['SECRETARIA']).to(['read']),
      allow.groups(['HOSPITAL']).to(['read']),
    ]),

  PatientDoctor: a
    .model({
      id: a.id().required(),
      patientId: a.id().required(),
      doctorId: a.id().required(),
      hospitalId: a.id().required(),
      assignedAt: a.datetime(),
      isActive: a.boolean().default(true),

      patient: a.belongsTo('Patient', 'patientId'),
      doctor: a.belongsTo('Doctor', 'doctorId'),
    })
    .authorization((allow) => [
      allow.owner().identityClaim('sub').to(['create', 'read', 'delete']),  // paciente gestiona sus doctors
      allow.groups(['DOCTOR']).to(['read']),
      allow.groups(['SECRETARIA', 'HOSPITAL']).to(['read']),
    ]),

  Appointment: a
    .model({
      id: a.id().required(),
      patientId: a.id().required(),
      doctorId: a.id().required(),
      hospitalId: a.id().required(),
      scheduledAt: a.datetime().required(),
      durationMinutes: a.integer().default(30),

      status: a.enum([
        'PENDING',
        'CONFIRMED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW',
      ]),

      reason: a.string(),
      doctorNotes: a.string(),      
      cancellationReason: a.string(),

      createdByRole: a.enum(['PACIENTE', 'SECRETARIA', 'DOCTOR', 'HOSPITAL']),
      patient: a.belongsTo('Patient', 'patientId'),
      doctor: a.belongsTo('Doctor', 'doctorId'),
    })
    .authorization((allow) => [
      allow.owner().identityClaim('sub').to(['create', 'read', 'update']), 
      allow.groups(['DOCTOR']).to(['read', 'update']),
      allow.groups(['SECRETARIA']).to(['create', 'read', 'update', 'delete']),
      allow.groups(['HOSPITAL']).to(['read']),
    ]),

});

export type Schema = typeof schema;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
      apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});