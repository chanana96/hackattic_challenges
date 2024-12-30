type TPbkdf2 = {
    rounds: number;
    hash: "sha256";
};

type TScrypt = {
    N: number;
    p: number;
    r: number;
    buflen: 32;
    _control: string;
};

type TProblem = {
    password: string;
    salt: string;
    pbkdf2: TPbkdf2;
    scrypt: TScrypt;
};

type TSolution = {
    sha256: string;
    hmac: string;
    pbkdf2: string;
    scrypt: string;
};

export { TPbkdf2, TScrypt, TProblem, TSolution };
