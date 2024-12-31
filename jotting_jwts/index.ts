import { getProblem, submitSolution } from "../main";
import { solveProblem } from "./solution";
import { logger } from "../logger";
import { TProblem, TSolution } from "./types";
import { startServer, startNgrok } from "./server";
import { challengeName } from "./constants";

const solution = async () => {
    try {
        await startServer();
        const ngrok_url = await startNgrok();
        const problem = await getProblem<TProblem["problem"]>(challengeName);
        const solution = solveProblem({ problem, ngrok_url });
        const result = await submitSolution<TSolution>(solution, challengeName);
        logger.info("Solution response", { data: result });
    } catch (error) {
        logger.error("Error in challenge", { error });
    }
};

solution();

//https://hackattic.com/challenges/jotting_jwts
