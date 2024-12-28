import { getProblem, submitSolution } from "../main";
import { logger } from "../logger";

const challengeName = "help_me_unpack";

type TProblem = {
    bytes: string;
};

type TSolution = {
    int: number;
    uint: number;
    short: number;
    float: number;
    double: number;
    big_endian_double: number;
};

const solveProblem = (problem: TProblem): TSolution => {
    const buffer = Buffer.from(problem.bytes, "base64");
    logger.info("Original base64", { bytes: problem.bytes });

    const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
    );
    const dataView = new DataView(arrayBuffer);

    return {
        int: dataView.getInt32(0, true),
        uint: dataView.getUint32(4, true),
        short: dataView.getInt16(8, true),
        float: dataView.getFloat32(12, true),
        double: dataView.getFloat64(16, true),
        big_endian_double: dataView.getFloat64(24),
    };
};

export const solution = async () => {
    try {
        const problem = await getProblem<TProblem>(challengeName);
        const solution = solveProblem(problem);
        const result = await submitSolution<TSolution>(solution, challengeName);
        logger.info("Solution response", { data: result });
    } catch (error) {
        logger.error("Error in challenge", { error });
    }
};
