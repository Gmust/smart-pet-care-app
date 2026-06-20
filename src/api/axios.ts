import { registerAuthInterceptors } from "./interceptors";
import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  console.warn(
    "EXPO_PUBLIC_API_URL is not set - API requests will use relative URLs and fail. Set it in .env."
  );
}

export const api = axios.create({ baseURL });

export const noAuthApi = axios.create({ baseURL });

axios.defaults.baseURL = baseURL;

registerAuthInterceptors(api);
registerAuthInterceptors(axios);

export const createApiBaseURL = (path: string): string => {
  if (!baseURL) {
    return path;
  }

  return `${baseURL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};
