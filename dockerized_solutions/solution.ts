import { TProblem, TSolution } from "./types";
import axios from "axios";
import ngrok from "ngrok";
import child_process, { ChildProcess } from "child_process";
import { promisify } from "util";
import { NGROK_TOKEN, BASEURL } from "../main";

const exec = async (command: string) => {
    const shell = promisify(child_process.exec);
    return shell(command, {
        shell: "powershell",
    });
};

const runNgrok = async () => {
    try {
        const url = await ngrok.connect({ authtoken: NGROK_TOKEN, addr: 5000 });
        return url;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const init = async () => {
    try {
        await exec("docker container stop registry");
        await exec("docker rm registry");
        await exec("Remove-Item -Path auth -Recurse -Force -ErrorAction SilentlyContinue");
        await exec("New-Item -ItemType Directory -Force -Path auth");
    } catch (e: unknown) {
        if (e instanceof ChildProcess) {
            console.log(e.stderr);
        }
    }
};

const configureRegistry = async ({ user, password }: { user: string; password: string }) => {
    try {
        const CREATE_PASSWORD_FILE = `docker run --rm --entrypoint htpasswd httpd:2 -Bbn ${user} ${password} | Set-Content -Encoding ASCII auth/htpasswd`;
        const RUN_CONTAINER = `docker run -d \
  -p 5000:5000 \
  --name registry \
    -v "${process.cwd()}/auth:/auth:ro" \
  -e "REGISTRY_AUTH=htpasswd" \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
  registry:2`;

        await init();
        await exec(CREATE_PASSWORD_FILE);
        await exec(RUN_CONTAINER);
        await exec(`docker login -p ${password} -u ${user} localhost:5000`);
    } catch (e: unknown) {
        if (e instanceof ChildProcess) {
            console.log(e.stderr);
        }
        throw e;
    }
};

const parseTags = async (output: string) => {
    const match = output.match(/Content\s+:\s+({.*})/);
    if (match) {
        try {
            const jsonData = JSON.parse(match[1]);
            console.log(jsonData);
            return jsonData;
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    } else {
        console.error("Could not find JSON content in the output.");
        throw Error;
    }
};

const pullFromRegistry = async ({
    ignition_key,
    user,
    password,
    registry_host,
}: {
    ignition_key: string;
    user: string;
    password: string;
    registry_host: string;
}) => {
    try {
        const GET_TAGS = `Invoke-WebRequest -Uri "${registry_host}/v2/hack/tags/list" \
    -Headers @{ Authorization = "Basic $( [Convert]::ToBase64String( [Text.Encoding]::ASCII.GetBytes('${user}:${password}') ) )" }`;

        const output = (await exec(GET_TAGS)).stdout;
        const { tags } = await parseTags(output);

        const pull = await Promise.all(
            tags.map((tag: string) => {
                return exec(`docker pull ${registry_host}/hack:${tag}`);
            }),
        );
        if (pull) {
            return await Promise.all(
                tags.map((tag: string) => {
                    return exec(
                        `docker run --rm -e IGNITION_KEY=${ignition_key} ${registry_host}/hack:${tag}`,
                    );
                }),
            );
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const solve = async (problem: TProblem): Promise<TSolution> => {
    try {
        const {
            credentials: { user, password },
            ignition_key,
            trigger_token,
        } = problem;
        const dud = "oops, wrong image!\n";

        const triggerUrl = `${BASEURL}/_/push/${trigger_token}`;
        await configureRegistry({ user, password });
        const registry_host = (await runNgrok()).split("//")[1];
        await axios.post(
            triggerUrl,
            {
                registry_host,
            },
            {
                timeout: 60000,
            },
        );
        const keys = await pullFromRegistry({ ignition_key, user, password, registry_host });
        const secret = keys
            ?.filter((key) => {
                return key.stdout !== dud;
            })[0]
            .stdout.trim();

        return {
            secret,
        };
    } catch (e) {
        console.log(e);
        throw e;
    }
};
