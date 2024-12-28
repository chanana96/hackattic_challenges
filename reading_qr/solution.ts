import { getProblem, submitSolution } from "../main";
import { logger } from "../logger";
import jsQR from "jsqr";
import { Jimp } from "jimp";

const challengeName = "reading_qr";

type TProblem = {
    image_url: string;
};

type TSolution = {
    code: string;
};

const solveProblem = async (problem: TProblem): Promise<TSolution> => {
    try {
        const image = await Jimp.read(problem.image_url);
        const ui8c = new Uint8ClampedArray(image.bitmap.data);
        let code = jsQR(ui8c, image.bitmap.width, image.bitmap.height);
        logger.info("code qr", { data: code });
        return {
            code: code.data,
        };
    } catch (error) {
        logger.error(`Error in solveProblem(): ${error}`, { error });
    }
};

export const solution = async () => {
    try {
        const problem = await getProblem<TProblem>(challengeName);
        const solution = await solveProblem(problem);
        const result = await submitSolution<TSolution>(solution, challengeName);
        logger.info("Solution response", { data: result });
    } catch (error) {
        logger.error("Error in solution()", { error });
    }
};
