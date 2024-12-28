import { api, SOLUTION_URL, PROBLEM_URL } from "../main";
import { logger } from "../logger";
import type { AxiosResponse } from "axios";

type TSolution = {
    int: number;
    uint: number;
    short: number;
    float: number;
    double: number;
    big_endian_double: number;
};

const problem_url = `/help_me_unpack${PROBLEM_URL}`;
const solution_url = `/help_me_unpack${SOLUTION_URL}`;

export const help_me_unpack = async () => {
    const response = await api.get(problem_url);
    const bytes = response.data.bytes;
    const solutionResponse = await help_me_unpack_solution(bytes);
    logger.info("Solution response", { data: solutionResponse });
};

const help_me_unpack_solution = async (bytes: string): Promise<AxiosResponse> => {
    const buffer = Buffer.from(bytes, "base64");
    logger.info("Original base64", { bytes });

    const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
    );
    const dataView = new DataView(arrayBuffer);

    const int = dataView.getInt32(0, true);
    const uint = dataView.getUint32(4, true);
    const short = dataView.getInt16(8, true);
    const float = dataView.getFloat32(12, true);
    const double = dataView.getFloat64(16, true);
    const big_endian_double = dataView.getFloat64(24);

    const solution: TSolution = {
        int: int,
        uint: uint,
        short: short,
        float: float,
        double: double,
        big_endian_double: big_endian_double,
    };
    const response = await api.post(solution_url, solution);
    return response.data;
};
