import { TProblem, TSolution } from "./types";
import axios from "axios";
import sharp from "sharp";
import vision from "@google-cloud/vision";

const preprocessImage = async (inputPath: Buffer, outputPath: string) => {
    await sharp(inputPath)
        .png()
        .resize({ width: 500, height: 800, fit: "fill" })
        .toFile(outputPath);
};

const ocr = async (filename: string) => {
    try {
        const client = new vision.ImageAnnotatorClient();
        const visionConfig = {
            image: {
                source: { filename },
            },
            features: [
                {
                    type: "DOCUMENT_TEXT_DETECTION",
                    model: "builtin/latest",
                },
                {
                    type: "SYMBOL_DETECTION",
                },
            ],
            imageContext: {
                languageHints: ["en-t-i0-handwrit", "zh"],
                textDetectionParams: {
                    enabledTypes: ["DIGIT", "SYMBOL"],
                },
                recognitionParams: {
                    allowedCharacters: "0123456789+-x÷",
                },
            },
        };
        const [result] = await client.annotateImage(visionConfig);

        const parsed = result.fullTextAnnotation?.text
            ?.replaceAll("x", "*")
            .replaceAll("÷", "/")
            .replaceAll(" ", "")
            .split("\n");
        if (!parsed) {
            throw Error;
        }
        console.log(parsed);
        return parsed;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const extremelyAdvancedAndComplexArithmetic = async (nums: string[]) => {
    try {
        let prev = 0;
        for (let i = 0; i <= nums.length - 1; i++) {
            const operator = nums[i][0];
            const num = nums[i].slice(1);
            prev = Math.floor(Number(eval(`${prev}${operator}${num}`)));
        }
        return prev;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const solve = async (problem: TProblem): Promise<TSolution> => {
    try {
        const { image_url } = problem;
        const path = "img.png";
        const res = await axios.get(image_url, {
            responseType: "arraybuffer",
        });
        await preprocessImage(res.data, path);
        const parsed = await ocr(path);
        const result = await extremelyAdvancedAndComplexArithmetic(parsed);
        return {
            result,
        };
    } catch (e) {
        console.error(e);
        throw e;
    }
};
