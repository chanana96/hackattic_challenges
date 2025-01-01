type TProblem = {
    private_key: string;
    required_data: TRequiredData;
};

type TRequiredData = {
    domain: string;
    serial_number: string;
    country: string;
};

type TSolution = {
    certificate: string;
};

type CertificateAttributes = [
    { name: "commonName"; value: TRequiredData["domain"] },
    { name: "countryName"; value: InternetCountryCode },
];

type InternetCountryCode = string;

type SetCertificateParams = {
    pemKey: string;
    attrs: CertificateAttributes;
    cleanSerialNumber: string;
};

export {
    TProblem,
    TSolution,
    TRequiredData,
    CertificateAttributes,
    InternetCountryCode,
    SetCertificateParams,
};
