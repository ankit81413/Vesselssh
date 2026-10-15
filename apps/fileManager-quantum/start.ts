import { readFileSync } from "node:fs";
import path from "node:path";

const systemInfoPath = path.resolve(
    process.cwd(),
    "../data/sys/systemInfo/info.json"
);

const systemInfo = JSON.parse(
    readFileSync(systemInfoPath, "utf-8")
);

const apiUrl = `${systemInfo.serverUrl}:${systemInfo.port}`

type JobStatus = { id: string; status: string; exitCode?: number | null };

async function waitForAppReady(jobId: string, url: string): Promise<void> {
    const deadline = Date.now() + 30_000;

    while (Date.now() < deadline) {
        const statusResponse = await fetch(`${apiUrl}/api/trm/ListTrmBackGroundJobs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ownerApp: "FileManagerQuantum" }),
            signal: AbortSignal.timeout(Math.min(2000, Math.max(1, deadline - Date.now()))),
        });
        if (!statusResponse.ok) {
            throw new Error(`Could not check FileManagerQuantum job: HTTP ${statusResponse.status}`);
        }
        const saved = await statusResponse.json() as { data: JobStatus[] };
        const job = saved.data.find((item) => item.id === jobId);
        if (!job) throw new Error("File Manager Quantum job was not found");
        if (job.status !== "running") {
            throw new Error(`File Manager Quantum startup failed: ${job.status} (exit code ${job.exitCode ?? "unknown"}). Check the job logs.`);
        }
        if (Date.now() >= deadline) break;

        // The file browser is ready only after its health endpoint confirms it.
        try {
            const response = await fetch(`${url}/health`, {
                signal: AbortSignal.timeout(Math.min(5000, deadline - Date.now())),
            });
            if (response.ok) {
                const health = await response.json() as { message?: string };
                if (health.message === "ok") {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    return
                };
            }
        } catch {
            // Connection refusal/timeouts are expected while the service starts.
        }

        const remaining = deadline - Date.now();
        if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, Math.min(1000, remaining)));
    }

    throw new Error("FileManagerQuantum did not become HTTP-ready within 30 seconds. The job may still be starting; check its logs.");
}

export async function start() {
    const port = 48287;
    const res = await fetch(`${apiUrl}/api/trm/startTrmBackGroundJob`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ownerApp: "FileManagerQuantum",
            command: "./filebrowser",
            cwd: "/home/charlie/Vesselssh/apps/fileManager-quantum",
        }),
        signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Could not start File Manager Quantum: HTTP ${res.status}`);
    const job = await res.json();
    if (!job.data?.id) throw new Error("Job starter did not return a File Manager Quantum job ID");

    await waitForAppReady(job.data.id, `${systemInfo.serverUrl}:${port}`);

    return {
        status: "running",
        clt_url: `${systemInfo.serverUrl}:${port}/`,
        data: { ...job, port },
    };
}
