import { defineFunction } from '@aws-amplify/backend-function';

export const createUser = defineFunction({
  name: 'createUser',
  entry: './handler.ts',
  resourceGroupName: 'data'
});