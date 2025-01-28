import { TProblem, TSolution } from "./types";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "node:fs/promises";
import csv from "csv-parser";
import { createReadStream } from "node:fs";

const importSnapshot = async (snapshot: Buffer) => {
    try {
        const execAsync = promisify(exec);
        await fs.writeFile("dump.rdb", snapshot);
        await execAsync("rdb -c memory dump.rdb -f memory.csv");
        const dump = (await execAsync("rdb -c json  dump.rdb")).stdout;
        return JSON.parse(dump);
    } catch (e) {
        console.error(e);
    }
};

const processDump = async ({
    check_type_of,
    jsonDump,
}: {
    check_type_of: string;
    jsonDump: Record<string, string>[];
}) => {
    try {
        const emojiRegex = new RegExp(
            /(\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,
        );
        const res = {
            db_count: jsonDump.length,
            emoji_key_value: "",
            expiry_millis: 0,
            [check_type_of]: "",
        };

        for (let db of jsonDump) {
            const keys = Object.keys(db);
            const test = keys.filter((key) => {
                return emojiRegex.test(key);
            });
            if (test.length) {
                res.emoji_key_value = db[test[0]];
            }
        }

        return new Promise((resolve, reject) => {
            createReadStream("memory.csv")
                .pipe(csv())
                .on("data", (data: Record<string, string>) => {
                    const { type, expiry, key } = data;

                    if (expiry) {
                        res.expiry_millis = new Date(expiry.slice(0, -3) + "Z").getTime();
                    } else if (key === check_type_of) {
                        res[check_type_of] = type;
                    }
                })
                .on("end", () => {
                    resolve(res);
                })
                .on("error", (e) => {
                    console.error(e);
                    reject(e);
                });
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const solve = async (problem: TProblem): Promise<TSolution> => {
    try {
        const {
            rdb,
            requirements: { check_type_of },
        } = problem;
        const HEADER = "REDIS0009";
        const buffer = Buffer.from(rdb, "base64").subarray(9);
        const newHeader = Buffer.concat([Buffer.from(HEADER), buffer]);
        const snapshot = Buffer.concat([newHeader, buffer]);
        const jsonDump = await importSnapshot(snapshot);
        const result = (await processDump({ check_type_of, jsonDump })) as TSolution;

        return result;
    } catch (e) {
        console.error(e);
        throw e;
    }
};
