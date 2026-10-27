import { readFileSync } from "node:fs";
import path from "node:path";

const systemInfoPath = path.resolve(
    process.cwd(),
    "../data/sys/systemInfo/info.json"
);

const systemInfo = JSON.parse(
    readFileSync(systemInfoPath, "utf-8")
);


export function start() {

    const port = 8086;
    console.log("karo as started")
    return {
        status: "running",
        clt_url: `/PreinstalledApps/Karo`,
    };
}