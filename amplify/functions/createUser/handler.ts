// amplify/functions/createUser/handler.ts
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminAddUserToGroupCommand } from "@aws-sdk/client-cognito-identity-provider";
import type { Schema } from "../../data/resource";

const client = new CognitoIdentityProviderClient();

export const handler: Schema["Usuario"]["functionHandler"] = async (event) => {
  const { email, nombre, grupo } = event.arguments;
  const userPoolId = process.env.AUTH_USER_POOL_ID;

  try {
    const createParams = {
      UserPoolId: userPoolId,
      Username: email,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: nombre },
        { Name: "email_verified", Value: "true" },
        { Name: "custom:rol", Value: grupo },
      ]
    };

    await client.send(new AdminCreateUserCommand(createParams));
    const addToGroupParams = {
      UserPoolId: userPoolId,
      Username: email,
      GroupName: grupo,
    };

    await client.send(new AdminAddUserToGroupCommand(addToGroupParams));

    return {
      success: true,
      message: `Usuario ${email} registrado exitosamente en el grupo ${grupo}.`
    };

  } catch (error: any) {
    console.error("Error creando usuario:", error);
    return {
      success: false,
      message: error.message || "Error interno al crear el usuario."
    };
  }
};