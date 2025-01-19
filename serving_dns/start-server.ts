import { getProblem } from "../main";
import { TProblem } from "./types";
import { runDnsServer } from "./server";

const challengeName = "serving_dns";

export const startServer = async () => {
    try {
        const problem = await getProblem<TProblem>(challengeName);
        const { records } = problem;

        console.log("Starting DNS server with records:", records);
        await runDnsServer({ records });
    } catch (e) {
        console.error("Failed to start DNS server:", e);
        process.exit(1);
    }
};

startServer();
