import axios from 'axios';

interface HttpConfig {
  baseURL: string;
}

const http = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const createHttp = (config: HttpConfig) => {
  http.defaults.baseURL = config.baseURL;
};

http.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default http;

export {
  createRequest,
  fetchReceivedRequests,
  fetchRequestDetail,
  replyRequest,
} from './request.api';
export {
  createRoutine,
  deleteRoutine,
  fetchRoutineDetail,
  fetchRoutines,
  updateRoutine,
} from './routine.api';
