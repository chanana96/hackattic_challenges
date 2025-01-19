import { getProblem, submitSolution } from "../main";
import { solve } from "./solution";
import { logger } from "../logger";
import { TProblem, TSolution } from "./types";

const challengeName = "serving_dns";

const solution = async () => {
    try {
        const solution = await solve();
        const result = await submitSolution<TSolution>(solution, challengeName);
        logger.info("Solution response", { data: result });
    } catch (e) {
        logger.error("Error in challenge", { e });
    }
};

solution();

//https://hackattic.com/challenges/serving_dns
