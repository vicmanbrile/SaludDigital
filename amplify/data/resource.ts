import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { createUser } from '../functions/createUser/resource';

const schema = a.schema({
  Medication: a.customType({
    name: a.string().required(),
    dose: a.string(),
    frequency: a.string(),
  }),
  
  Patient: a.model({
    id: a.id().required(),
    name: a.string().required(),
    age: a.integer(),
    clinicalNotes: a.string(), 
    hospitalId: a.id(),
    meds: a.ref('Medication').array(),
  }).authorization((allow) => [
    allow.group("DOCTOR").to(['read']),
    allow.authenticated().to(['create', 'read', 'update', 'delete']),
    allow.publicApiKey()

    /*
    // El administrador del Hospital gestiona todo su centro
    allow.group("HOSPITAL").to(['create', 'read', 'update', 'delete']),
    // El Doctor lee y edita datos clínicos
    allow.group("DOCTOR").to(['read', 'update']),
    // La Secretaria solo registra y ve datos básicos
    allow.group("SECRETARIA").to(['read', 'create']),
    // El Paciente solo lee su propia ficha
    allow.owner(),
    */
  ]),
  
  Usuario: a
  .mutation()
  .arguments({
      email: a.string().required(),
      nombre: a.string().required(),
      grupo: a.string().required()
    })
    .returns(
      a.customType({
        success: a.boolean(),
        message: a.string()
      })
    )
    .handler(a.handler.function(createUser))
    .authorization(allow => [
      allow.group('SECRETARIA'),
      allow.group('HOSPITAL')
    ])
    
  });

  Appointment: a.model({
    time: a.string(),
    reason: a.string(),
    status: a.string(),
    patientId: a.id(),
  }).authorization((allow) => [
    allow.authenticated().to(['create', 'read', 'update', 'delete']),
    allow.publicApiKey()

    /*
    allow.groups(["DOCTOR", "SECRETARIA", "HOSPITAL"]).to(['read', 'create', 'update']),
    allow.owner()
    */
  ]);

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ 
  schema, 
  authorizationModes: {
    defaultAuthorizationMode : 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  }
});