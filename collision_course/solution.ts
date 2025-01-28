import { TProblem, TSolution } from "./types";
import crypto from "crypto";

const generateHash = async (include: string): Promise<[string, string]> => {
    try {
        const COLLISION_BLOCK1 = Buffer.from(
            "4dc968ff0ee35c209572d4777b721587d36fa7b21bdc56b74a3dc0783e7b9518afbfa200a8284bf36e8e4b55b35f427593d849676da0d1555d8360fb5f07fea2",
            "hex",
        );
        const COLLISION_BLOCK2 = Buffer.from(
            "4dc968ff0ee35c209572d4777b721587d36fa7b21bdc56b74a3dc0783e7b9518afbfa202a8284bf36e8e4b55b35f427593d849676da0d1d55d8360fb5f07fea2",
            "hex",
        );

        const prefix = Buffer.from(include, "utf8");
        const buffer1 = Buffer.concat([COLLISION_BLOCK1, prefix]);
        const buffer2 = Buffer.concat([COLLISION_BLOCK2, prefix]);

        const hash1 = crypto.createHash("md5").update(buffer1).digest("hex");
        const hash2 = crypto.createHash("md5").update(buffer2).digest("hex");

        if (hash1 === hash2) {
            return [buffer1.toString("base64"), buffer2.toString("base64")];
        }
        throw Error("no collision :(");
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const solve = async (problem: TProblem): Promise<TSolution> => {
    try {
        const { include } = problem;
        const files = await generateHash(include);
        return {
            files,
        };
    } catch (e) {
        console.error(e);
        throw e;
    }
};
