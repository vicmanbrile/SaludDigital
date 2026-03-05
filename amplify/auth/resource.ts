import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ["PACIENTE", "SECRETARIA", "DOCTOR", "HOSPITAL"],
  userAttributes: {
    "custom:hospitalId": {
      dataType: "String",
      mutable: true,
    },
  },
});