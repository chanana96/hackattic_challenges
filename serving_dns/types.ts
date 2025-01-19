import * as dnsPacket from "dns-packet";

export type DnsRecord = Array<{
    type: dnsPacket.RecordType;
    data: string | { mbox: string; txt: string };
}>;

export type TProblem = {
    records: DnsRecord;
};

export type TSolution = {
    dns_ip: string;
    dns_port: number;
};
