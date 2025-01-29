export type TProblem = {
    credentials: {
        user: string;
        password: string;
    };
    ignition_key: string;
    trigger_token: string;
};

export type TSolution = {
    secret: string;
};
