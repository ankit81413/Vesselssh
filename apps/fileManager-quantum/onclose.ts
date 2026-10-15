import { readFileSync } from "node:fs";
import path from "node:path";

const systemInfoPath = path.resolve(
    process.cwd(),
    "../data/sys/systemInfo/info.json"
);

const systemInfo = JSON.parse(readFileSync(systemInfoPath, "utf-8")) as {
    serverUrl: string;
    port: number;
};

const apiUrl = `${systemInfo.serverUrl}:${systemInfo.port}`;
const ownerApp = "FileManagerQuantum";

type BackgroundJob = {
    id: string;
    status: string;
};

type StopResult = {
    id: string;
    status: string;
    stopped: boolean;
};

/** Stop every active File Manager Quantum process started by VesselSSH. */
export async function onclose(): Promise<{
    status: "stopped";
    jobs: StopResult[];
}> {
    const listResponse = await fetch(`${apiUrl}/api/trm/ListTrmBackGroundJobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerApp }),
        signal: AbortSignal.timeout(5000),
    });

    if (!listResponse.ok) {
        throw new Error(`Could not list File Manager Quantum jobs: HTTP ${listResponse.status}`);
    }

    const { data } = await listResponse.json() as { data: BackgroundJob[] };
    const jobs: StopResult[] = [];

    // Stop sequentially because each stop updates the shared job registry on disk.
    for (const job of data.filter((item) => item.status === "running")) {
        const stopResponse = await fetch(`${apiUrl}/api/trm/stopTrmBackGroundJob`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ownerApp, jobId: job.id }),
            signal: AbortSignal.timeout(5000),
        });

        if (!stopResponse.ok) {
            throw new Error(`Could not stop File Manager Quantum job ${job.id}: HTTP ${stopResponse.status}`);
        }

        jobs.push(await stopResponse.json() as StopResult);
    }

    console.log("File Manager Quantum Stopped");
    return { status: "stopped", jobs };
}
