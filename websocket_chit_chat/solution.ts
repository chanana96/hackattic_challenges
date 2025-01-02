import { TProblem, TSolution } from "./types";
import { logger } from "../logger";
import WebSocket from "ws";

const hackatticWSS = "wss://hackattic.com/_/ws/";
const cue = "ping!";
const secretPhrase = "congratulations! the solution to this challenge is ";
let interval = 0;

const getWsClient = (socketURL: string) => {
    const wsClient = new WebSocket(socketURL, {
        perMessageDeflate: false,
    });
    wsClient.on("error", console.error);

    return wsClient;
};

const startInterval = () => {
    interval = Date.now();
};

const stopInterval = () => {
    interval = Math.round((Date.now() - interval) / 100) * 100;

    console.log(interval);
    return interval;
};

export const solve = async (problem: TProblem): Promise<TSolution> => {
    return new Promise((resolve, reject) => {
        try {
            const socketURL = `${hackatticWSS}${problem.token}`;
            const wsClient = getWsClient(socketURL);

            wsClient.on("open", function open() {
                startInterval();
                console.log(`starting interval at ${interval}`);
            });
            wsClient.on("message", function message(data) {
                let stringifiedData = String(data);
                if (stringifiedData == cue) {
                    wsClient.send(stopInterval());
                    startInterval();
                } else if (stringifiedData.startsWith(secretPhrase)) {
                    const secret = stringifiedData.slice(
                        secretPhrase.length + 1,
                        stringifiedData.length - 1,
                    );
                    wsClient.close();
                    resolve({ secret: secret });
                }
                console.log(stringifiedData);
            });
        } catch (e) {
            logger.error("Error in solve", { e });
            reject(e);
        }
    });
};
