import { getProblem, submitSolution } from "../main";
import { solve } from "./solution";
import { logger } from "../logger";
import { TProblem, TSolution } from "./types";

const challengeName = "collision_course";

const solution = async () => {
    try {
        const problem = await getProblem<TProblem>(challengeName);
        const solution = await solve(problem);
        const result = await submitSolution<TSolution>(solution, challengeName);
        logger.info("Solution response", { data: result });
    } catch (error) {
        logger.error("Error in challenge", { error });
    }
};

solution();

//https://hackattic.com/challenges/collision_course
