import { createHttp } from "@repo/shared/api";

export const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

createHttp({
  baseURL: BASE_URL,
});