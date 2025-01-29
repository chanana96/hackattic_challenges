import { getProblem, submitSolution } from "../main";
import { solve } from "./solution";
import { logger } from "../logger";
import { TProblem, TSolution } from "./types";
import { AxiosError } from "axios";
export const challengeName = "dockerized_solutions";

const solution = async () => {
    try {
        const problem = await getProblem<TProblem>(challengeName);
        const solution = await solve(problem);
        const result = await submitSolution<TSolution>(solution, challengeName);
        logger.info("Solution response", { data: result });
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(error.status);
        } else {
            console.error(error);
        }
    }
};

solution();

//https://hackattic.com/challenges/dockerized_solutions
