import axios, { AxiosRequestConfig, AxiosError } from "axios";

import "dotenv/config";

export const PROXIES: { host: string; port: number }[] = JSON.parse(process.env.PROXIES as string);
export const PROXY_USERNAME: string = process.env.PROXY_USERNAME!;
export const PROXY_PASSWORD: string = process.env.PROXY_PASSWORD!;
export const NGROK_TOKEN = process.env.NGROK_TOKEN;
export const PORT = process.env.PORT;
export const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
export const api = axios.create({
    baseURL: "https://hackattic.com/challenges/",
    timeout: 60000,
});

export const getChallengeUrls = (challengeName: string) => {
    return {
        problemUrl: `/${challengeName}/problem?access_token=${ACCESS_TOKEN}`,
        solutionUrl: `/${challengeName}/solve?access_token=${ACCESS_TOKEN}`,
    };
};

export const getProblem = async <T>(
    challengeName: string,
    config?: AxiosRequestConfig,
): Promise<T> => {
    const { problemUrl } = getChallengeUrls(challengeName);
    const response = await api.get(problemUrl, config);
    return response.data;
};

export const submitSolution = async <T>(solution: T, challengeName: string): Promise<unknown> => {
    try {
        const { solutionUrl } = getChallengeUrls(challengeName);
        const response = await api.post(solutionUrl, solution);
        return response.data;
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            console.error("Status:", e.response?.status);
            console.error("Status Text:", e.response?.statusText);
            console.error("Response Data:", e.response?.data);
            console.error("Request Data:", e.config?.data);
        }
    }
};
