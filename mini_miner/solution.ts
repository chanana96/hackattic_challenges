import { TProblem, TSolution, TBlock } from "./types";
import { createHash } from "node:crypto";

const hexToBinary = (hexHash: string) => {
    return hexHash
        .split("")
        .map((char) => parseInt(char, 16).toString(2).padStart(4, "0"))
        .join("");
};

const checkLeadingZeros = (stringified: string, difficulty: number) => {
    const bin = hexToBinary(createHash("sha256").update(stringified).digest("hex"));

    return bin.startsWith("0".repeat(difficulty));
};

const calculateNonce = (problem: TProblem) => {
    const difficulty = problem.difficulty;
    const block: TBlock = {
        data: problem.block.data,
        nonce: 0,
    };
    const baseJson = `{"data":${JSON.stringify(block.data)},"nonce":`;

    while (true) {
        console.log(block.nonce);
        const stringified = `${baseJson}${block.nonce}}`;
        if (checkLeadingZeros(stringified, difficulty)) {
            return block.nonce;
        }
        block.nonce++;
    }
};

export const solveProblem = async (problem: TProblem): Promise<TSolution> => {
    try {
        const nonce = calculateNonce(problem);
        return { nonce: nonce };
    } catch (e) {
        console.log(e);
        throw e;
    }
};
