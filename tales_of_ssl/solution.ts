import {
    TProblem,
    TSolution,
    TRequiredData,
    CertificateAttributes,
    InternetCountryCode,
    SetCertificateParams,
} from "./types";
import forge, { pki } from "node-forge";
import lookup from "country-code-lookup";

const HEADER = "-----BEGIN PRIVATE KEY-----";
const FOOTER = "-----END PRIVATE KEY-----";

const findCountryCode = (countryName: TRequiredData["country"]): InternetCountryCode => {
    let result = lookup.byCountry(countryName);

    if (!result) {
        const simplifiedName = countryName.replace(/\s*\([^)]*\)\s*/g, " ").trim();
        result = lookup.byCountry(simplifiedName);
    }

    if (!result) {
        const firstWord = countryName.split(" ")[0];
        result = lookup.countries.find((c) =>
            c.country.toLowerCase().includes(firstWord.toLowerCase()),
        );
    }

    if (!result) {
        throw new Error(`Could not find country code for: ${countryName}`);
    }

    return result.internet;
};

const setCertificate = ({ pemKey, attrs, cleanSerialNumber }: SetCertificateParams) => {
    const privateKey = pki.privateKeyFromPem(pemKey);
    const publicKey = pki.setRsaPublicKey(privateKey.n, privateKey.e);
    const cert = pki.createCertificate();

    cert.publicKey = publicKey;

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.serialNumber = cleanSerialNumber;
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    cert.sign(privateKey);
    const asn1Cert = pki.certificateToAsn1(cert);
    const derBytes = forge.asn1.toDer(asn1Cert).getBytes();
    const certificate = forge.util.encode64(derBytes);

    return certificate;
};

export const solveProblem = async (problem: TProblem): Promise<TSolution> => {
    try {
        const { private_key, required_data } = problem;
        const countryCode = findCountryCode(required_data.country);
        const attrs: CertificateAttributes = [
            {
                name: "commonName",
                value: required_data.domain,
            },
            {
                name: "countryName",
                value: countryCode,
            },
        ];
        const pemKey = `${HEADER} ${private_key} ${FOOTER}`;

        const cleanSerialNumber = required_data.serial_number.replace("0x", "");
        const certificate = setCertificate({ pemKey, attrs, cleanSerialNumber });

        return { certificate };
    } catch (e) {
        console.log(e);
        throw e;
    }
};
