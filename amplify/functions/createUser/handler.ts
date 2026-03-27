import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminAddUserToGroupCommand } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient();

export const handler = async (event: any) => {
  
  const { email, nombre, grupo } = event.arguments;  
  const userPoolId = process.env.AMPLIFY_AUTH_USERPOOL_ID;

  try {
    
    const userAttributes = [
      { Name: 'email', Value: email },
      { Name: 'name', Value: nombre },
      { Name: 'email_verified', Value: 'true' }
    ];
    
    await client.send(new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email,
      UserAttributes: userAttributes,
      DesiredDeliveryMediums: ['EMAIL']
    }));

    
    await client.send(new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: email,
      GroupName: grupo
    }));

    return { 
      success: true, 
      message: `El usuario ${email} fue creado y asignado al grupo ${grupo} con éxito.` 
    };

  } catch (error: any) {
    console.error("Error en Lambda:", error);
    return { 
      success: false, 
      message: error.message || "Hubo un error desconocido" 
    };
  }
};