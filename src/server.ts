import express from "express";
import dotenv from "dotenv";
import db from "./modules/db.ts";
dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

process.on("exit", () => {
    db.end();
    process.exit();
});
process.on("SIGINT", () => {
    db.end();
    process.exit();
});
process.on("SIGTERM", () => {
    db.end();
    process.exit();
});