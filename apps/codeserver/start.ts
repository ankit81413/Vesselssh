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
            body: JSON.stringify({ ownerApp: "CodeServer" }),
            signal: AbortSignal.timeout(Math.min(2000, Math.max(1, deadline - Date.now()))),
        });
        if (!statusResponse.ok) {
            throw new Error(`Could not check code-server job: HTTP ${statusResponse.status}`);
        }
        const saved = await statusResponse.json() as { data: JobStatus[] };
        const job = saved.data.find((item) => item.id === jobId);
        if (!job) throw new Error("Code-server job was not found");
        if (job.status !== "running") {
            throw new Error(`Code-server startup failed: ${job.status} (exit code ${job.exitCode ?? "unknown"}). Check the job logs.`);
        }
        if (Date.now() >= deadline) break;

        // A login redirect or authentication challenge also means HTTP is ready.
        try {
            const response = await fetch(url, {
                redirect: "manual",
                signal: AbortSignal.timeout(Math.min(2000, deadline - Date.now())),
            });
            const ready = (response.status >= 200 && response.status < 400)
                || response.status === 401 || response.status === 403;
            await response.body?.cancel();
            if (ready) return;
        } catch {
            // Connection refusal/timeouts are expected while the service starts.
        }

        const remaining = deadline - Date.now();
        if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, Math.min(250, remaining)));
    }

    throw new Error("Code-server did not become HTTP-ready within 30 seconds. The job may still be starting; check its logs.");
}

export async function start() {
    const port = 8080;
    const res = await fetch(`${apiUrl}/api/trm/startTrmBackGroundJob`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ownerApp: "CodeServer",
            command: "code-server",
            args: ["--bind-addr", `127.0.0.1:${port}`, "."],
            cwd: "/",
        }),
        signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Could not start code-server: HTTP ${res.status}`);
    const job = await res.json();
    if (!job.data?.id) throw new Error("Job starter did not return a code-server job ID");

    await waitForAppReady(job.data.id, `http://127.0.0.1:${port}/`);

    return {
        status: "running",
        clt_url: `http://localhost:${port}/`,
        data: { ...job, port },
    };
}
