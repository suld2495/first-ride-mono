import { AxiosRequestConfig } from 'axios';

import axiosInstance from '.';

const get = <R, D>(url: string, config?: AxiosRequestConfig<D>): Promise<R> => {
  return axiosInstance.get(url, config);
};

const post = <R, D>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>,
): Promise<R> => {
  return axiosInstance.post(url, data, config);
};

const put = <R, D>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>,
): Promise<R> => {
  return axiosInstance.put(url, data, config);
};

const patch = <R, D>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>,
): Promise<R> => {
  return axiosInstance.patch(url, data, config);
};

const deleteApi = <R, D>(
  url: string,
  config?: AxiosRequestConfig<D>,
): Promise<R> => {
  return axiosInstance.delete(url, config);
};

const http = {
  get,
  post,
  put,
  patch,
  delete: deleteApi,
};

export default http;
