import { TProblem, TSolution } from "./types";
import "dotenv/config";

const UDP_TUNNEL_IP = process.env.UDP_TUNNEL_IP;
const UDP_TUNNEL_PORT = Number(process.env.UDP_TUNNEL_PORT);

export const solve = async (): Promise<TSolution> => {
    try {
        const result = {
            dns_ip: UDP_TUNNEL_IP,
            dns_port: UDP_TUNNEL_PORT,
        };
        return result;
    } catch (e) {
        console.error(`Solution function error: ${e}`);
        throw e;
    }
};
