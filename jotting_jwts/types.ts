type TProblem = {
    problem: {
        jwt_secret: string;
    };
    ngrok_url: string;
};

type TSolution = {
    app_url: string;
};

export { TProblem, TSolution };
