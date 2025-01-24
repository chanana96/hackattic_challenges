import { TProblem, TSolution } from "./types";
import { Worker } from "worker_threads";
import path from "path";
import axios from "axios";
import * as fs from "node:fs/promises";

const zipName = "package.zip";

export const addWorker = async (index: number) => {
    try {
        let minLength = 5;
        const alphabetOnly = "abcdefghijklmnopqrstuvwxyz";
        let start = alphabetOnly[Math.floor((index / 5) * (alphabetOnly.length - 1))];

        return new Promise((resolve, reject) => {
            const worker = new Worker(path.resolve(__dirname, "worker.js"), {
                workerData: {
                    start,
                    minLength,
                    zipPath: zipName,
                },
            });

            worker.on("message", (result) => {
                resolve(result);
            });
            worker.on("error", (error) => {
                reject(error);
            });
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getWorkers = async (workerLength: number) => {
    try {
        const workers = [];
        for (let index = 0; index <= workerLength - 1; index++) {
            workers.push(addWorker(index));
        }
        return workers;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const solve = async (problem: TProblem): Promise<TSolution> => {
    try {
        const { zip_url } = problem;

        const response = await axios.get(zip_url, {
            responseType: "arraybuffer",
        });

        await fs.writeFile(path.resolve(__dirname, zipName), response.data);

        const workers = await getWorkers(6);
        const result = (await Promise.any(workers)) as Uint8Array;

        if (!result) {
            throw Error("no password found");
        }
        const decoder = new TextDecoder("utf-8");
        const secret = decoder.decode(result).replace(/\n$/, "");

        console.log(secret);
        return {
            secret,
        };
    } catch (e) {
        console.error(e);
        throw e;
    }
};
