import {listBackgroundJobs, startBackgroundJob, stopBackgroundJob } from "@cmd/trm/TerminalBacJob.js";
import { Request, Response } from "express";

export function ListTrmBackGroundJobs(req: Request, res: Response) {
    const ownerApp = req.body.ownerApp
    const data = listBackgroundJobs(ownerApp)
    res.status(200).json({
        msg: "success",
        data
    })
}

export async function startTrmBackGroundJobs(req: Request, res: Response) {
    const jobDetails = req.body
    const data = startBackgroundJob({
        ownerApp: jobDetails.ownerApp,
        command: jobDetails.command,
        args: jobDetails.args,
        cwd: jobDetails.cwd
    })
    res.status(200).json({
        msg: "success",
        data
    })
}

export async function stopTrmBackGroundJobs(req: Request, res: Response) {
    const { jobId, ownerApp } = req.body ?? {};

    if (typeof jobId !== "string" || typeof ownerApp !== "string") {
        return res.status(400).json({ error: "jobId and ownerApp are required" });
    }

    const data = stopBackgroundJob(jobId, ownerApp);
    res.status(200).json(data);

}
