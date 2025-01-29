import { getProblem, submitSolution } from "../main";
import { solve } from "./solution";
import { logger } from "../logger";
import { TProblem, TSolution } from "./types";
export const challengeName = "basic_face_detection";

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

//https://hackattic.com/challenges/basic_face_detection
