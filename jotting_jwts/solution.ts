import { TProblem, TSolution } from "./types";
import { challengeName } from "./constants";
import { setJwtSecret } from "./server";

export const solveProblem = ({ problem, ngrok_url }: TProblem): TSolution => {
    const { jwt_secret } = problem;
    const app_url = `${ngrok_url}/${challengeName}`;
    setJwtSecret(jwt_secret);
    return {
        app_url: app_url,
    };
};
