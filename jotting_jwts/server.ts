import express from "express";
import { PORT, NGROK_TOKEN } from "../main";
import { challengeName } from "./constants";
import ngrok from "ngrok";
import type { TProblem } from "./types";
import jwt, { JwtPayload } from "jsonwebtoken";
import getRawBody from "raw-body";

type TokenKey = {
    append?: string;
} & JwtPayload;

type SolutionResponse = {
    solution: string;
};

const app = express();
let jwtSecret: TProblem["problem"]["jwt_secret"];
let solution: SolutionResponse["solution"] = "";
let server: ReturnType<typeof app.listen>;

export const setJwtSecret = (secret: TProblem["problem"]["jwt_secret"]) => {
    jwtSecret = secret;
};

export const startServer = async () => {
    server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    return server;
};

export const startNgrok = async (): Promise<TProblem["ngrok_url"]> => {
    const url = await ngrok.connect({
        authtoken: NGROK_TOKEN,
        addr: PORT,
        onStatusChange: (status) => {
            console.log(status);
        },
    });

    return url;
};

app.post(`/${challengeName}`, async (req, res) => {
    const rawData = await getRawBody(req, { encoding: "utf8" });
    try {
        let decoded: TokenKey = jwt.verify(rawData, jwtSecret) as TokenKey;
        if (decoded.append) {
            solution += decoded.append;
            res.json({});
        } else {
            res.json({ solution: solution });
        }
        console.log(`decoded: ${JSON.stringify(decoded)}`);
        console.log(`solution: ${solution}`);
    } catch (e) {
        console.log(e);
        res.send("invalid token");
        return;
    }
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});
