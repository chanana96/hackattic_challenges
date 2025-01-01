type TProblem = {
    difficulty: number;
    block: TBlock;
};

type TBlock = {
    nonce: number;
    data: string;
};

type TSolution = {
    nonce: TBlock["nonce"];
};
export { TProblem, TSolution, TBlock };
