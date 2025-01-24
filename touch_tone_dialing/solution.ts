import { TProblem, TSolution } from "./types";
import axios from "axios";
import { readWav } from "./goertzel";

export const solve = async (problem: TProblem): Promise<TSolution> => {
    try {
        const { wav_url } = problem;
        const response = await axios.get(wav_url, {
            responseType: "arraybuffer",
        });
        console.log(response.data);
        const sequence = await readWav(response.data);
        return {
            sequence: String(sequence),
        };
    } catch (e) {
        console.error(e);
        throw e;
    }
};
