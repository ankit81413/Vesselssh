import { readFile } from "node:fs/promises";
import type { Request, Response } from "express";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const installedAppFile = new URL(
    "../../../data/sys/registry/installedApps.json",
    import.meta.url
);

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const vesselRoot = path.resolve(currentDir, "../../..");

export async function openApp(req: Request, res: Response) {
    const contents = await readFile(installedAppFile, "utf-8");
    const installedApps = JSON.parse(contents);
    const app = req.params.appid;

    if (typeof app !== "string") {
        return res.status(400).json({ error: "Invalid app ID" });
    }

    const hasApp = Object.hasOwn(installedApps, app)

    if (!hasApp) {
        return res.status(400).json({ error: "App not installed" });
    }

    const installedAppData = installedApps[app]
    const startPath = installedAppData.start.replace(/^\/+/, "");
    const appPath = path.resolve(vesselRoot, startPath);
    const appModule = await import(pathToFileURL(appPath).href);
    const result = await appModule.start();

    res.send({
        msg: "success",
        data: result
    })
}

export async function closeApp(req: Request, res: Response) {
    const contents = await readFile(installedAppFile, "utf-8");
    const installedApps = JSON.parse(contents);
    const app = req.params.appid;

    if (typeof app !== "string") {
        return res.status(400).json({ error: "Invalid app ID" });
    }

    const hasApp = Object.hasOwn(installedApps, app)

    if (!hasApp) {
        return res.status(400).json({ error: "App not installed" });
    }

    const installedAppData = installedApps[app]
    const stopPath = installedAppData.onclose.replace(/^\/+/, "");
    const appPath = path.resolve(vesselRoot, stopPath);
    const appModule = await import(pathToFileURL(appPath).href);
    const result = await appModule.onclose();

    res.send({
        msg: "success",
        result
    })
}
