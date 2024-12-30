import axios, { AxiosRequestConfig } from "axios";
import "dotenv/config";

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
    const { solutionUrl } = getChallengeUrls(challengeName);
    const response = await api.post(solutionUrl, solution);
    return response.data;
};
