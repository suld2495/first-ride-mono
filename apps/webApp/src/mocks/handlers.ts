import { requestHandlers } from './handlers/request';
import { routineHandlers } from './handlers/routine';

export const handlers = [...requestHandlers, ...routineHandlers];
