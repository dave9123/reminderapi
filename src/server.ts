import express from "express";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import helmet from "helmet";
import fs from "fs";
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
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    xPermittedCrossDomainPolicies: false,
    xFrameOptions: false,
    xDownloadOptions: false,
    strictTransportSecurity: process.env.NODE_ENV === "production" ? { maxAge: 31536000, includeSubDomains: true } : false,
    referrerPolicy: false,
}));
app.use(express.text({ type: "*/*" }));

import user from "./routes/user";
import reminders from "./routes/reminders";
import subscription from "./routes/subscription";
app.use("/api/user", user);
app.use("/api/reminders", reminders);
app.use("/api/subscription", subscription);

import subscriptionHandler from "./modules/subscriptionHandler";
subscriptionHandler();

app.use(express.static("public"));

fs.readFile("public/index.html", "utf8", (err, data) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    const updatedData = data
        .replace(/<h1><a href=".*?">reminderapi<\/a><\/h1>/, `<h1><a href="${process.env.BASEURL}">reminderapi</a></h1>`)
        .replace(/<link rel="stylesheet" href=".*?">/, `<link rel="stylesheet" href="${process.env.BASEURL}/assets/css/style.css">`)
        .replace(
            /{"@context":"https:\/\/schema\.org","@type":"WebSite","headline":"ReminderAPI","name":"reminderapi","url":".*?"}/,
            `{"@context":"https://schema.org","@type":"WebSite","headline":"ReminderAPI","name":"reminderapi","url":"${process.env.BASEURL}"}`
        )
        .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${process.env.BASEURL}" />`)
        .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${process.env.BASEURL}" />`);

    fs.writeFile("public/index.html", updatedData, (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    });
});

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