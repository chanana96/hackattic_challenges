import { createHash, createHmac, pbkdf2Sync, scryptSync } from "node:crypto";
import { TProblem, TSolution, TPbkdf2, TScrypt } from "./types";

type THashInput = Pick<TProblem, "password"> & Pick<TPbkdf2, "hash">;
type THmacInput = { saltBytes: Buffer } & THashInput;
type TPbkdf2Input = Pick<TPbkdf2, "rounds"> & THmacInput & Pick<TScrypt, "buflen">;
type TGetScryptInput = Omit<TScrypt, "_control"> & Omit<THmacInput, "hash">;

const getHash = ({ password, hash }: THashInput) => {
    const result = createHash(hash).update(password).digest("hex");
    return result;
};

const getHmac = ({ hash, saltBytes, password }: THmacInput) => {
    const key = createHmac(hash, saltBytes);
    key.update(password);
    const result = key.digest("hex");
    return result;
};

const getPbkdf2 = ({ password, saltBytes, rounds, hash, buflen }: TPbkdf2Input) => {
    const key = pbkdf2Sync(password, saltBytes, rounds, buflen, hash);
    const result = key.toString("hex");
    return result;
};

const getScrypt = ({ password, saltBytes, buflen, N, p, r }: TGetScryptInput) => {
    const key = scryptSync(password, saltBytes, buflen, {
        N: N,
        p: p,
        r: r,
        maxmem: N * 2 * r * 65,
    });
    const result = key.toString("hex");
    return result;
};

export const solveProblem = (problem: TProblem): TSolution => {
    const {
        password,
        salt,
        pbkdf2: { hash, rounds },
        scrypt: { N, p, r, buflen },
    } = problem;
    const saltBytes = Buffer.from(salt, "base64");
    console.log(N, p, r);
    const sha256 = getHash({ password, hash });
    const hmac = getHmac({ hash, saltBytes, password });
    const pbkdf2 = getPbkdf2({ password, saltBytes, rounds, hash, buflen });
    const scrypt = getScrypt({ password, saltBytes, buflen, N, p, r });

    const solution = {
        sha256: sha256,
        hmac: hmac,
        pbkdf2: pbkdf2,
        scrypt: scrypt,
    };
    console.log(solution);
    return solution;
};
