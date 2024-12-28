import axios from "axios";
import "dotenv/config";
export const api = axios.create({
    baseURL: "https://hackattic.com/challenges/",
});

export const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

export const PROBLEM_URL = `/problem?access_token=${ACCESS_TOKEN}`;
export const SOLUTION_URL = `/solve?access_token=${ACCESS_TOKEN}`;
