export type TProblem = {
    ssh_key: string;
    username: string;
    repo_path: string;
    push_token: string;
};

export type TSolution = {
    secret: string;
};

export type PermissionParams = {
    repoDir: string;
    username: TProblem["username"];
};
