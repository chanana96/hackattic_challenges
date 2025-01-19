import { DnsRecord } from "./types";
import "dotenv/config";
import dgram from "node:dgram";
import dnsPacket from "dns-packet";

const server = dgram.createSocket("udp4");

export type CustomAnswerTypeBecauseTypescriptCantInferThatTheDataIsOnlyAnObjectIfTheRecordTypeIsRp =
    {
        type: dnsPacket.RecordType;
        class: "IN";
        name: string;
        data: string | { mbox: string; txt: string };
    };
export type CustomPacket = Omit<dnsPacket.Packet, "answers"> & {
    answers: CustomAnswerTypeBecauseTypescriptCantInferThatTheDataIsOnlyAnObjectIfTheRecordTypeIsRp[];
};

export const runDnsServer = async ({ records }: { records: DnsRecord }) => {
    try {
        server.on("message", (msg, rinfo) => {
            const incomingReq = dnsPacket.decode(msg);
            const question = incomingReq.questions[0];
            const record = records.filter((record) => question.type == record.type)[0];
            if (record) {
                const responseData = record.data;

                const answer: CustomPacket = {
                    type: "response",
                    id: incomingReq.id,
                    flags: dnsPacket.AUTHORITATIVE_ANSWER,
                    questions: incomingReq.questions,
                    answers: [
                        {
                            type: question.type,
                            class: "IN",
                            name: question.name,
                            data:
                                question.type === "RP"
                                    ? { mbox: responseData as string, txt: "." }
                                    : responseData,
                        },
                    ],
                };

                server.send(
                    dnsPacket.encode(answer as dnsPacket.Packet),
                    rinfo.port,
                    rinfo.address,
                );
            }
        });

        server.bind(2001, () => console.log("DNS Server is running on port 2001"));
    } catch (e) {
        console.error(e);
    }
};
