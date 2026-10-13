
import { execFile, spawn, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

export type BackgroundJobStatus =
    | "running"
    | "stopped"
    | "exited"
    | "error";

export interface StartBackgroundJobOptions {
    ownerApp: string;
    command: string;
    args?: string[];
    cwd: string;
    env?: Record<string, string>;
}

interface BackgroundJob {
    id: string;
    ownerApp: string;
    command: string;
    pid: number | undefined;
    status: BackgroundJobStatus;
    startedAt: number;
    endedAt?: number;
    exitCode?: number | null;
    logs: string[];
}

const jobsFile = fileURLToPath(new URL("../data/terminalBackGroundJobs.json", import.meta.url));
const processes = new Map<string, ChildProcess>();
const executeFile = promisify(execFile);

function readJobs(): BackgroundJob[] {
    try {
        const jobs: unknown = JSON.parse(readFileSync(jobsFile, "utf8"));
        if (!Array.isArray(jobs)) throw new Error("Background jobs file must contain an array");
        return jobs as BackgroundJob[];
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
        throw error;
    }
}

function writeJobs(jobs: BackgroundJob[]): void {
    mkdirSync(path.dirname(jobsFile), { recursive: true });
    const temporaryFile = `${jobsFile}.${process.pid}.tmp`;
    writeFileSync(temporaryFile, JSON.stringify(jobs, null, 2) + "\n", { mode: 0o600 });
    renameSync(temporaryFile, jobsFile);
}

function saveJob(job: BackgroundJob): void {
    const jobs = readJobs();
    const index = jobs.findIndex((saved) => saved.id === job.id);
    if (index === -1) jobs.push(job);
    else {
        if (jobs[index].status === "stopped" && job.status === "running") {
            job.status = "stopped";
        }
        jobs[index] = job;
    }
    writeJobs(jobs);
}

// Saved PIDs cannot safely be used to regain ownership after a backend restart.
const savedJobs = readJobs();
let recovered = false;
for (const job of savedJobs) {
    if (job.status === "running") {
        job.status = "error";
        job.logs.push("Backend restarted; process control was lost. The process may still be running.");
        recovered = true;
    }
}
if (recovered) writeJobs(savedJobs);

// Keep output bounded so long-running processes cannot consume
// unlimited memory.
const MAX_LOG_LINES = 1000;
const MAX_LOG_LINE_LENGTH = 4000;

// Only these executables can be launched through this service.
// Add trusted executables deliberately as VesselSSH grows.
const ALLOWED_COMMANDS = new Set([
    "code-server",
    "node",
    "npm",
]);

function getCommandName(command: string): string {
    return path.basename(command).toLowerCase();
}

function addLog(job: BackgroundJob, data: string): void {
    for (const line of data.split(/\r?\n/)) {
        if (!line) continue;

        job.logs.push(line.slice(0, MAX_LOG_LINE_LENGTH));

        if (job.logs.length > MAX_LOG_LINES) {
            job.logs.splice(0, job.logs.length - MAX_LOG_LINES);
        }
    }
    saveJob(job);
}

function getOwnedJob(
    jobId: string,
    ownerApp: string
): BackgroundJob {
    const job = readJobs().find((saved) => saved.id === jobId);

    if (!job) {
        throw new Error("Background job not found");
    }

    if (job.ownerApp !== ownerApp) {
        throw new Error("Not authorized to access this job");
    }

    return job;
}

export function startBackgroundJob(
    options: StartBackgroundJobOptions
) {
    const { ownerApp, command, cwd } = options;
    const args = options.args ?? [];

    if (!/^[a-zA-Z0-9_-]+$/.test(ownerApp)) {
        throw new Error("Invalid owner app ID");
    }

    if (!ALLOWED_COMMANDS.has(getCommandName(command))) {
        throw new Error("Executable is not allowed");
    }

    if (!path.isAbsolute(cwd)) {
        throw new Error("Working directory must be absolute");
    }

    // Do not inherit the backend's PORT or secrets wholesale.
    // Applications receive a deliberately limited environment.
    const env: Record<string, string> = {
        PATH: process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin",
        HOME: process.env.HOME ?? "",
        USER: process.env.USER ?? "",
        LANG: process.env.LANG ?? "C.UTF-8",
        TERM: "xterm-256color",
        ...options.env,
    };

    // Prevent callers from overriding these backend-specific values.
    delete env.PORT;
    delete env.NEXT_PUBLIC_VESSEL_SERVER_URL;

    const child = spawn(command, args, {
        cwd,
        env,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
    });

    const job: BackgroundJob = {
        id: randomUUID(),
        ownerApp,
        command,
        pid: child.pid,
        status: "running",
        startedAt: Date.now(),
        logs: [],
    };

    processes.set(job.id, child);

    child.once("spawn", () => {
        job.pid = child.pid;
        saveJob(job);
    });

    child.stdout?.on("data", (data: Buffer) => {
        addLog(job, data.toString());
    });

    child.stderr?.on("data", (data: Buffer) => {
        addLog(job, data.toString());
    });

    child.once("error", (error) => {
        job.status = "error";
        job.endedAt = Date.now();
        addLog(job, `Process error: ${error.message}`);
        processes.delete(job.id);
    });

    child.once("exit", (code) => {
        job.exitCode = code;
        job.endedAt = Date.now();

        const saved = readJobs().find((saved) => saved.id === job.id);
        if (saved?.status === "stopped") job.status = "stopped";
        if (job.status !== "stopped" && job.status !== "error") {
            job.status = "exited";
        }
        saveJob(job);
        processes.delete(job.id);
    });

    try {
        saveJob(job);
    } catch (error) {
        child.removeAllListeners("spawn");
        child.removeAllListeners("exit");
        child.removeAllListeners("error");
        child.on("error", () => {});
        child.stdout?.removeAllListeners("data");
        child.stderr?.removeAllListeners("data");
        child.kill();
        processes.delete(job.id);
        throw error;
    }

    return {
        id: job.id,
        ownerApp: job.ownerApp,
        pid: child.pid,
        status: job.status,
    };
}

export function getBackgroundJobStatus(
    jobId: string,
    ownerApp: string
) {
    const job = getOwnedJob(jobId, ownerApp);

    return {
        id: job.id,
        ownerApp: job.ownerApp,
        pid: job.pid,
        status: job.status,
        startedAt: job.startedAt,
        endedAt: job.endedAt,
        exitCode: job.exitCode,
    };
}

export function getBackgroundJobLogs(
    jobId: string,
    ownerApp: string
) {
    const job = getOwnedJob(jobId, ownerApp);

    return [...job.logs];
}

/** Linux TCP listeners for a managed job and its descendants; not an HTTP readiness check. */
export async function getBackgroundJobPorts(jobId: string, ownerApp: string): Promise<number[]> {
    const job = getOwnedJob(jobId, ownerApp);
    const child = processes.get(jobId);
    if (job.status !== "running") return [];
    if (!child || !job.pid || child.pid !== job.pid) {
        throw new Error("Cannot inspect an unmanaged background job after restart");
    }
    if (process.platform !== "linux") throw new Error("Job port lookup requires Linux");

    const options = { timeout: 5000, maxBuffer: 4 * 1024 * 1024 };
    const { stdout: processList } = await executeFile("ps", ["-e", "-o", "pid=,ppid="], options);
    const descendants = new Set([job.pid]);
    const rows = processList.trim().split("\n").map((line) => line.trim().split(/\s+/).map(Number));
    let added = true;
    while (added) {
        added = false;
        for (const [pid, parent] of rows) {
            if (descendants.has(parent) && !descendants.has(pid)) {
                descendants.add(pid);
                added = true;
            }
        }
    }

    const { stdout: sockets } = await executeFile("ss", ["-H", "-l", "-t", "-n", "-p"], options);
    const ports = new Set<number>();
    for (const line of sockets.split("\n")) {
        const owners = [...line.matchAll(/\bpid=(\d+)/g)];
        if (!owners.some((match) => descendants.has(Number(match[1])))) continue;
        const localAddress = line.trim().split(/\s+/)[3];
        const port = Number(localAddress?.match(/:(\d+)$/)?.[1]);
        if (Number.isInteger(port) && port > 0 && port <= 65535) ports.add(port);
    }

    // A process can exit while the inspection commands are running.
    if (processes.get(jobId) !== child || getOwnedJob(jobId, ownerApp).status !== "running") return [];
    return [...ports].sort((a, b) => a - b);
}

/** Returns null until a listener is visible; refuses to guess when several ports exist. */
export async function getBackgroundJobPort(jobId: string, ownerApp: string): Promise<number | null> {
    const ports = await getBackgroundJobPorts(jobId, ownerApp);
    if (ports.length > 1) throw new Error("Job listens on multiple ports; use getBackgroundJobPorts");
    return ports[0] ?? null;
}

export function stopBackgroundJob(
    jobId: string,
    ownerApp: string
) {
    const job = getOwnedJob(jobId, ownerApp);

    if (job.status !== "running") {
        return {
            id: job.id,
            status: job.status,
            stopped: false,
        };
    }

    // This stops the direct child process. If the application
    // creates child processes, process-tree cleanup needs handling.
    const stopped = processes.get(job.id)?.kill("SIGTERM") ?? false;

    if (stopped) {
        job.status = "stopped";
        saveJob(job);
    }

    return {
        id: job.id,
        status: job.status,
        stopped,
    };
}

export function listBackgroundJobs(ownerApp: string) {
    return readJobs()
        .filter((job) => job.ownerApp === ownerApp)
        .map((job) => ({
            id: job.id,
            ownerApp: job.ownerApp,
            pid: job.pid,
            status: job.status,
            startedAt: job.startedAt,
            endedAt: job.endedAt,
            exitCode: job.exitCode,
        }));
}
