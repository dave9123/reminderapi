import express from "express";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import db from "./modules/db";
dotenv.config();

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

import user from "./routes/user";
import reminder from "./routes/reminders";
import subscription from "./routes/subscription";
app.use("/api/user", user);
app.use("/api/reminder", reminder);
app.use("/api/subscription", subscription);

import subscriptionHandler from "./modules/subscriptionHandler";
subscriptionHandler();

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