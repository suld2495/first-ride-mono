import { authHandlers } from './handlers/auth';
import { friendsHandlers } from './handlers/friends';
import { requestHandlers } from './handlers/request';
import { routineHandlers } from './handlers/routine';
import { userHandlers } from './handlers/user';

export const handlers = [
  ...requestHandlers, 
  ...routineHandlers, 
  ...authHandlers, 
  ...friendsHandlers, 
  ...userHandlers,
];
