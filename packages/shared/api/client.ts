import type { AxiosRequestConfig, AxiosResponse } from 'axios';

import axiosInstance, { toAppError } from '.';

const get = async <R, D>(
  url: string,
  config?: AxiosRequestConfig<D>,
): Promise<R> => {
  try {
    const response = await axiosInstance.get<
      { data: R },
      AxiosResponse<{ data: R }>,
      D
    >(url, config);

    return response.data.data;
  } catch (error) {
    throw toAppError(error);
  }
};

const post = async <R, D>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>,
): Promise<R> => {
  try {
    const response = await axiosInstance.post<
      { data: R },
      AxiosResponse<{ data: R }>,
      D
    >(url, data, config);

    return response.data.data;
  } catch (error) {
    throw toAppError(error);
  }
};

const put = async <R, D>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>,
): Promise<R> => {
  try {
    const response = await axiosInstance.put<
      { data: R },
      AxiosResponse<{ data: R }>,
      D
    >(url, data, config);

    return response.data.data;
  } catch (error) {
    throw toAppError(error);
  }
};

const patch = async <R, D>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>,
): Promise<R> => {
  try {
    const response = await axiosInstance.patch<
      { data: R },
      AxiosResponse<{ data: R }>,
      D
    >(url, data, config);

    return response.data.data;
  } catch (error) {
    throw toAppError(error);
  }
};

const deleteApi = async <R, D>(
  url: string,
  config?: AxiosRequestConfig<D>,
): Promise<R> => {
  try {
    const response = await axiosInstance.delete<
      { data: R },
      AxiosResponse<{ data: R }>,
      D
    >(url, config);

    return response.data.data;
  } catch (error) {
    throw toAppError(error);
  }
};

const http = {
  get,
  post,
  put,
  patch,
  delete: deleteApi,
};

export default http;
