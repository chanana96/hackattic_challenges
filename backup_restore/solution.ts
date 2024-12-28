import { getProblem, submitSolution } from "../main";
import { logger } from "../logger";
import fs from "node:fs/promises";
import zlib from "node:zlib";
import util from "node:util";
import "dotenv/config";
import pg, { QueryArrayResult } from "pg";

const gunzip = util.promisify(zlib.gunzip);
const exec = util.promisify(require("node:child_process").exec);
const challengeName = "backup_restore";
const PGPASSWORD = process.env.PGPASSWORD;
const database = "backup_restore";
const user = "postgres";
const dumpFileName = "backup.dump";
const query = `SELECT ssn FROM criminal_records WHERE status='alive'`;
const execCommand = `psql -U ${user} -o -d ${database} -c "DROP TABLE IF EXISTS criminal_records CASCADE;" -f ${dumpFileName}`;

type TProblem = {
    dump: string;
};
type TSolution = {
    alive_ssns: QueryArrayResult<unknown[]>[];
};

const pgClient = async () => {
    const { Pool } = pg;
    const pool = new Pool({
        user: user,
        password: PGPASSWORD,
        database: database,
    });
    const client = await pool.connect();
    return client;
};

const restore = async () => {
    const { stdout, stderr } = await exec(execCommand, {
        env: {
            ...process.env,
            PGPASSWORD: PGPASSWORD,
        },
    });
    console.log("stdout:", stdout);
    console.error("stderr:", stderr);
};

const solveProblem = async (problem: TProblem): Promise<TSolution> => {
    try {
        const bufferObj = Buffer.from(problem.dump, "base64");
        console.log(bufferObj.length);

        const decompressed = await gunzip(bufferObj);
        console.log("Decompressed bytes:", decompressed.toString("hex", 0, 8));
        await fs.writeFile(`./${dumpFileName}`, decompressed);
        const stats = await fs.stat(`./${dumpFileName}`);
        logger.info("Dump file stats", { size: stats.size });

        await restore();

        const client = await pgClient();

        const alive_ssns = await client.query({
            rowMode: "array",
            text: query,
        });
        console.log(alive_ssns.rows);
        client.release();
        return {
            alive_ssns: alive_ssns.rows.map((row) => row[0]),
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
