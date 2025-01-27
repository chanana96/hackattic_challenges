import axios from "axios";
import fs from "node:fs/promises";
import path from "node:path";
import { simpleGit, SimpleGit, SimpleGitOptions } from "simple-git";
import util from "node:util";
import child_process from "node:child_process";
import { TProblem, TSolution, PermissionParams } from "./types";
import { BASEURL, PUBLIC_IP } from "../main";

const exec = util.promisify(child_process.exec);
const ROOT_DIR = "C:\\Users";

const createUser = async (username: string) => {
    try {
        await exec(`New-LocalUser -Name '${username}' -NoPassword`);
        await exec(`net user ${username} /logonpasswordchg:no`);
        await exec(`runas /user:${username} powershell`);
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const setPermissions = async ({ repoDir, username }: PermissionParams) => {
    try {
        await exec(`icacls "${repoDir}" /setowner "${username}"`);
        await exec(`icacls "${repoDir}" /grant "${username}:(F)"`);
        await exec(`git config --global --add safe.directory *`);
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const prepareGit = async (repoDir: string) => {
    try {
        const options: Partial<SimpleGitOptions> = {
            baseDir: repoDir,
            binary: "git",
            maxConcurrentProcesses: 6,
            trimmed: true,
        };
        const git: SimpleGit = simpleGit(options);
        await git.init(true);
        return git;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const prepareDir = async (problem: TProblem) => {
    try {
        const { repo_path, ssh_key, username } = problem;
        const userDir = path.join(ROOT_DIR, username);
        const sshDir = path.join(userDir, ".ssh");
        const repoDir = path.join(userDir, repo_path);
        const authKeyPath = path.join(sshDir, "authorized_keys");
        await fs.mkdir(repoDir, { recursive: true });
        await fs.writeFile(authKeyPath, ssh_key);

        return repoDir;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const readSolution = async (git: SimpleGit) => {
    try {
        const secret = await git.show("HEAD:solution.txt");
        return secret.trim();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const solve = async (problem: TProblem): Promise<TSolution> => {
    try {
        const { push_token, username } = problem;
        const url = `${BASEURL}/_/git/${push_token}`;
        const repo_host = PUBLIC_IP;
        await createUser(username);
        const repoDir = await prepareDir(problem);
        const git = await prepareGit(repoDir);
        await setPermissions({ repoDir, username });
        await axios.post(url, {
            repo_host,
        });
        const secret = await readSolution(git);

        return {
            secret,
        };
    } catch (e) {
        console.error(e);
        throw e;
    }
};
