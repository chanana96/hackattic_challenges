import { TProblem, TSolution } from "./types";
import axios from "axios";
import sharp from "sharp";
import vision from "@google-cloud/vision";
import * as protoTypes from "@google-cloud/vision/build/protos/protos";
import fs from "fs/promises";

const preprocessImage = async (inputPath: Buffer, outputPath: string) => {
    let top = 0;
    const tileSize = 100;
    const promises: Promise<sharp.OutputInfo>[] = [];

    for (let i = 0; i < 8; i++) {
        let left = 0;
        for (let j = 0; j < 8; j++) {
            promises.push(
                sharp(inputPath)
                    .extract({
                        left,
                        top,
                        width: tileSize,
                        height: tileSize,
                    })
                    .toFile(`${outputPath}/${i},${j}.png`),
            );
            left += tileSize;
        }
        top += tileSize;
    }
    await Promise.all(promises);
};

const ocr = async (outputPath: string) => {
    try {
        const client = new vision.ImageAnnotatorClient();
        const files = await fs.readdir(outputPath);

        return Promise.all(
            files.map((file) =>
                client.faceDetection(`${outputPath}/${file}`).then((result) => ({
                    tile: file.slice(0, -4),
                    result,
                })),
            ),
        );
    } catch (e) {
        console.error(e);
        throw e;
    }
};
export const findTiles = async (
    data: {
        tile: string;
        result: [protoTypes.google.cloud.vision.v1.IAnnotateImageResponse];
    }[],
) => {
    try {
        const tiles = data
            .map((face) => {
                const annotation = face.result[0].faceAnnotations;
                if (annotation) {
                    if (annotation[0].landmarkingConfidence! > 0.1) {
                        return [Number(face.tile[0]), Number(face.tile[2])];
                    }
                    console.log(face.result[0].faceAnnotations);
                }
            })
            .filter((val) => val !== undefined);

        return tiles;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const solve = async (problem: TProblem): Promise<TSolution> => {
    try {
        const { image_url } = problem;
        const outputPath = "basic_face_detection/faces";

        const res = await axios.get(image_url, {
            responseType: "arraybuffer",
        });
        await preprocessImage(res.data, outputPath);
        const data = await ocr(outputPath);
        console.log(data);
        const face_tiles = await findTiles(data);
        console.log(face_tiles);
        return {
            face_tiles,
        };
    } catch (e) {
        console.error(e);
        throw e;
    }
};
