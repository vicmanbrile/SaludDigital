import { 
  CognitoIdentityProviderClient, 
  AdminCreateUserCommand, 
  AdminAddUserToGroupCommand,
  AdminSetUserPasswordCommand 
} from "@aws-sdk/client-cognito-identity-provider";
import type { Schema } from "../../data/resource";

const client = new CognitoIdentityProviderClient();

export const handler = async (event: any) => {
  const { email, nombre, grupo } = event.arguments;
  const userPoolId = process.env.AUTH_USER_POOL_ID;

  try {
    
    await client.send(new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: nombre },
        { Name: "email_verified", Value: "true" },
        { Name: "custom:rol", Value: grupo },
      ],
      MessageAction: "SUPPRESS", 
    }));

    
    
    await client.send(new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: email,
      Password: "Password123!", 
      Permanent: true,
    }));

    
    await client.send(new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: email,
      GroupName: grupo,
    }));

    return {
      message: `Usuario ${email} creado con éxito.`, 
    };

  } catch (error: any) {
    console.error(error);
    throw new Error(error.message); 
  }
};