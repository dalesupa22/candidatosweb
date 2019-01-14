export interface Record {
    id: String;
    categoryA: String;
    categoryB: String;
    comments: String;
    politicA: String;
    politicB: String;
    politicC: String;
    anonymus: Boolean;
    name: String;
    email: String;
    phone: String;
    code_state: String;
    code_city: String;
    gender: String;
    ipAddress: String;
    ipInfo: String;
    date: Date;
}

export interface Records {
    records: Array<Record>;
}
