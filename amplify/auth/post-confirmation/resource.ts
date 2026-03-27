import { defineFunction } from '@aws-amplify/backend-function';

export const postConfirmation = defineFunction({
  name: 'post-confirmation',
  entry: './handler.ts',
  resourceGroupName: 'auth',
});