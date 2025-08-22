import { promises as fs } from "node:fs";
import pathModule from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const pdfParse: (data: Buffer) => Promise<{ text: string }> = require("pdf-parse");

function resolveRelativeToCaller(relativeOrAbsolutePath: string): string {
    if (pathModule.isAbsolute(relativeOrAbsolutePath)) return relativeOrAbsolutePath;

    const stack = new Error().stack ?? "";
    const lines = stack.split("\n").map(l => l.trim());
    const thisModulePath = fileURLToPath(import.meta.url);

    let callerFilePath: string | null = null;
    for (const line of lines) {
        if (line.length === 0) continue;
        if (line.includes(thisModulePath)) continue;

        const fileUrlMatch = line.match(/\(?file:\/\/\/[^:)]+:\d+:\d+\)?$/);
        const winPathMatch = line.match(/\(?[A-Za-z]:\\[^:)]+:\d+:\d+\)?$/);

        let rawPath: string | null = null;
        if (fileUrlMatch) {
            rawPath = fileUrlMatch[0].replace(/[()]/g, "").replace(/:\d+:\d+$/, "");
            try {
                callerFilePath = fileURLToPath(rawPath);
            } catch {
                callerFilePath = null;
            }
        } else if (winPathMatch) {
            rawPath = winPathMatch[0].replace(/[()]/g, "").replace(/:\d+:\d+$/, "");
            callerFilePath = rawPath;
        }

        if (callerFilePath) break;
    }

    const baseDir = callerFilePath ? pathModule.dirname(callerFilePath) : process.cwd();
    return pathModule.resolve(baseDir, relativeOrAbsolutePath);
}

export async function read(filePath: string): Promise<string> {
    const resolvedPath = resolveRelativeToCaller(filePath);
    const extension = pathModule.extname(resolvedPath).toLowerCase();

    if (extension !== ".txt" && extension !== ".pdf") {
        throw new Error(`Unsupported file type: ${extension}. Only .txt and .pdf are supported.`);
    }

    if (extension === ".txt") {
        const content = await fs.readFile(resolvedPath, { encoding: "utf8" });
        return content;
    }

    const dataBuffer = await fs.readFile(resolvedPath);
    const parsed = await pdfParse(dataBuffer);
    return parsed.text;
}