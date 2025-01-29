import { getProblem, submitSolution } from "../main";
import { solve } from "./solution";
import { logger } from "../logger";
import { TProblem, TSolution } from "./types";
export const challengeName = "visual_basic_math";

const solution = async () => {
    try {
        const problem = await getProblem<TProblem>(challengeName);
        const solution = await solve(problem);
        const result = await submitSolution<TSolution>(solution, challengeName);
        logger.info("Solution response", { data: result });
    } catch (error) {
        console.error(error);
    }
};

solution();

//https://hackattic.com/challenges/visual_basic_math
