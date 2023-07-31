import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export async function axiosDownload(
  url: string,
  params?: any,
): Promise<AxiosResponse> {
  const config: AxiosRequestConfig = {
    url: url,
    method: 'GET',
    params,
  };
  return await axios(config);
}
