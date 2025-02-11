import express from "express";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import db from "./modules/db";
dotenv.config();

declare global {
    interface ReminderData {
        id: number;
        reminderid: string;
        userid: string;
        title: string;
        description: string;
        time: string;
        repeat: string;
        color: string;
        priority: string;
        tags: string[];
        sharedWith: string[];
        createdOn: string;
        updatedOn: string;
    }
}

if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
            nodeProfilingIntegration(),
        ],
        tracesSampleRate: 1.0,
    });
    Sentry.profiler.startProfiler();
}

const port = parseInt(process.env.PORT || "3000");
const app = express();
app.disable("x-powered-by");

import userRouter from "./routes/user";
import reminderRouter from "./routes/reminders";
app.use("/api", userRouter);
app.use("/api", reminderRouter);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

process.on("exit", () => {
    db.end();
    if (process.env.SENTRY_DSN) {
        Sentry.profiler.stopProfiler();
    }
    process.exit();
});

process.on("SIGINT", () => {
    db.end();
    if (process.env.SENTRY_DSN) {
        Sentry.profiler.stopProfiler();
    }
    process.exit();
});

process.on("SIGTERM", () => {
    db.end();
    if (process.env.SENTRY_DSN) {
        Sentry.profiler.stopProfiler();
    }
    process.exit();
});