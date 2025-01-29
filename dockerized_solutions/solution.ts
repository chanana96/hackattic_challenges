import { TProblem, TSolution } from "./types";

export const solve = async (problem: TProblem): Promise<TSolution> => {
    try {
        const {} = problem;
        const registry_host = "";
        return {
            registry_host,
        };
    } catch (e) {
        console.error(e);
        throw e;
    }
};
