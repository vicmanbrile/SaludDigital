import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from '@aws-sdk/client-cognito-identity-provider';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../data/resource';

const cognitoClient = new CognitoIdentityProviderClient();

const dataClient = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { sub, email, name } = event.request.userAttributes;
  
  const role = event.request.userAttributes['custom:rol'] || 'PACIENTE';

  try {
    
    await cognitoClient.send(new AdminAddUserToGroupCommand({
      GroupName: role,
      Username: event.userName,
      UserPoolId: event.userPoolId
    }));

    
    if (role === 'HOSPITAL') {
      await dataClient.models.Hospital.create({
        id: sub,
        name: name || 'Nuevo Hospital',
        adminEmail: email
      });
    }
    
    else if (role === 'PACIENTE') {
      await dataClient.models.Patient.create({
        patientAccountId: sub,
        name: name || 'Sin nombre'
      });
    }

    return event;
  } catch (error) {
    console.error("Error en PostConfirmation:", error);
    return event;
  }
};