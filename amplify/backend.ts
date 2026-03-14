import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { createUser } from './functions/createUser/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

var backend = defineBackend({
  auth,
  data,
  createUser,
});

backend.createUser.addEnvironment(
  'AMPLIFY_AUTH_USERPOOL_ID', 
  backend.auth.resources.userPool.userPoolId
);

backend.createUser.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'cognito-idp:AdminCreateUser',
      'cognito-idp:AdminAddUserToGroup'
    ],
    resources: [backend.auth.resources.userPool.userPoolArn]
  })
);