import { TProblem, TSolution } from "./types";
import axios from "axios";
import { PROXIES, PROXY_PASSWORD, PROXY_USERNAME, BASEURL } from "../main";

export const solve = async (problem: TProblem): Promise<TSolution> => {
    try {
        const proxyList = PROXIES;
        const { presence_token } = problem;
        const url = `${BASEURL}/_/presence/${presence_token}`;
        await axios.get(url);
        for (const proxy of proxyList) {
            const res = await axios.get(url, {
                proxy: {
                    host: proxy.host,
                    port: proxy.port,
                    protocol: "http",
                    auth: {
                        username: PROXY_USERNAME,
                        password: PROXY_PASSWORD,
                    },
                },
            });
            console.log(res.data);
        }

        return {};
    } catch (e) {
        console.error(e);
        throw e;
    }
};
