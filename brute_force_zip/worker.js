import { parentPort, workerData } from "worker_threads";
import AdmZip from "adm-zip";
import path from "path";

if (!parentPort) throw new Error("this module must be run as a worker");

const bruteForceWorker = ({ start, minLength, zipPath }) => {
    const secretFile = "secret.txt";
    const maxLength = 6;
    const alphabetOnly = "abcdefghijklmnopqrstuvwxyz";
    const fullCharset = "abcdefghijklmnopqrstuvwxyz0123456789";

    console.log(`start ch: ${start}`);
    const generateNextPassword = (current, minLength) => {
        if (!current) return start[0].repeat(minLength);

        let chars = current.split("");
        let position = chars.length - 1;

        while (position >= 0) {
            const currentCharset = position < 3 ? alphabetOnly : fullCharset;
            let index = currentCharset.indexOf(chars[position]);

            if (index < currentCharset.length - 1) {
                chars[position] = currentCharset[index + 1];
                return chars.join("");
            }
            chars[position] = currentCharset[0];
            position--;
        }

        if (chars.length < maxLength) {
            const newPosition = chars.length;
            const charsetToUse = newPosition < 3 ? alphabetOnly : fullCharset;
            return charsetToUse[0].repeat(chars.length + 1);
        }

        return null;
    };

    const bruteForceZip = async () => {
        try {
            const zip = new AdmZip(path.resolve(__dirname, zipPath));
            let currentPassword = start.repeat(minLength);
            while (currentPassword !== null) {
                try {
                    const buffer = zip.readFile(secretFile, currentPassword);
                    console.log(currentPassword);
                    return buffer;
                } catch (e) {
                    currentPassword = generateNextPassword(currentPassword, minLength);
                }
            }
            throw new Error(`password not found`);
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    return bruteForceZip();
};

bruteForceWorker(workerData)
    .then((result) => parentPort.postMessage(result))
    .catch((error) => parentPort.postMessage({ error: error.message }));
