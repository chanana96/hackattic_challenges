export type TProblem = {
    rdb: string;
    requirements: {
        check_type_of: string;
    };
};

type P<T extends string> = {
    [K in T]: string;
};

export type TSolution = {
    db_count: number;
    emoji_key_value: string;
    expiry_millis: number;
} & P<TProblem["requirements"]["check_type_of"]>;
