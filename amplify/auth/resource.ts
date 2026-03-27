import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from './post-confirmation/resource';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ["PACIENTE", "SECRETARIA", "DOCTOR", "HOSPITAL"],
  userAttributes: {
    "custom:docHospitalId": { dataType: "String", mutable: true },
    "custom:secHospitalId": { dataType: "String", mutable: true },
    "custom:hosHospitalId": { dataType: "String", mutable: true },
    "custom:rol": { dataType: "String", mutable: true },
  },
  triggers: {
    postConfirmation
  },
  access: (allow) => [
    allow.resource(postConfirmation).to(['addUserToGroup'])
  ]
});