import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";

export interface HttpError extends AxiosError {
  config: any & { _retry?: boolean };
}

export interface HttpResponse {
  status: number | string | null;
  statusText: string | null;
  data: any;
  dataNotFound?: Record<string, never>;
}

// Create Axios instance
const httpClient: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_ENDPOINT}`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Response interceptor
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: HttpError) => {
    return Promise.reject(error);
  }
);

export default httpClient;
