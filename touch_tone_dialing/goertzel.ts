import * as wav from "wav";

const LOW_FREQUENCIES = [697, 770, 852, 941];
const HIGH_FREQUENCIES = [1209, 1336, 1477, 1633];

const DTMF_MAP = [
    ["1", "2", "3", "A"],
    ["4", "5", "6", "B"],
    ["7", "8", "9", "C"],
    ["*", "0", "#", "D"],
];

const goertzel = (samples: number[], targetFrequency: number, sampleRate: number): number => {
    const k = Math.floor(0.5 + (samples.length * targetFrequency) / sampleRate);
    const omega = (2.0 * Math.PI * k) / samples.length;
    const cosine = Math.cos(omega);
    const sine = Math.sin(omega);
    const coeff = 2.0 * cosine;

    let q0 = 0;
    let q1 = 0;
    let q2 = 0;

    for (let i = 0; i < samples.length; i++) {
        q0 = coeff * q1 - q2 + samples[i];
        q2 = q1;
        q1 = q0;
    }

    const real = q1 - q2 * cosine;
    const imag = q2 * sine;
    return Math.sqrt(real * real + imag * imag);
};

const detectDTMFInWindow = (samples: number[], sampleRate: number): string | null => {
    let maxLowMagnitude = 0;
    let maxHighMagnitude = 0;
    let lowFreqIndex = -1;
    let highFreqIndex = -1;

    const lowMagnitudes = LOW_FREQUENCIES.map((freq) => goertzel(samples, freq, sampleRate));
    const highMagnitudes = HIGH_FREQUENCIES.map((freq) => goertzel(samples, freq, sampleRate));

    lowMagnitudes.forEach((magnitude, index) => {
        if (magnitude > maxLowMagnitude) {
            maxLowMagnitude = magnitude;
            lowFreqIndex = index;
        }
    });

    highMagnitudes.forEach((magnitude, index) => {
        if (magnitude > maxHighMagnitude) {
            maxHighMagnitude = magnitude;
            highFreqIndex = index;
        }
    });

    const avgLowMagnitude = lowMagnitudes.reduce((a, b) => a + b) / lowMagnitudes.length;
    const avgHighMagnitude = highMagnitudes.reduce((a, b) => a + b) / highMagnitudes.length;

    const threshold = 500;
    const relativeFactor = 2.0;

    if (
        maxLowMagnitude > threshold &&
        maxHighMagnitude > threshold &&
        maxLowMagnitude > avgLowMagnitude * relativeFactor &&
        maxHighMagnitude > avgHighMagnitude * relativeFactor
    ) {
        return DTMF_MAP[lowFreqIndex][highFreqIndex];
    }

    return null;
};

export const readWav = async (buffer: Buffer) => {
    try {
        return new Promise((resolve, reject) => {
            const reader = new wav.Reader();
            let sequence = "";
            let samples: number[] = [];

            reader.on("format", function (format) {
                const windowSize = Math.floor(format.sampleRate * 0.05);
                const stepSize = Math.floor(windowSize / 2);

                reader.on("data", (chunk) => {
                    for (let i = 0; i < chunk.length; i += 2) {
                        samples.push(chunk.readInt16LE(i));
                    }

                    while (samples.length >= windowSize) {
                        const window = samples.slice(0, windowSize);
                        const digit = detectDTMFInWindow(window, format.sampleRate);

                        if (
                            digit &&
                            (sequence.length === 0 || sequence[sequence.length - 1] !== digit)
                        ) {
                            sequence += digit;
                        }

                        samples = samples.slice(stepSize);
                    }
                });
            });

            reader.on("end", () => {
                resolve(sequence);
            });

            reader.on("error", reject);

            reader.write(buffer);
            reader.end();
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};
