import express from "express";
import * as chrono from "chrono-node";
import db from "../modules/db";
import checkAuthorization from "../modules/checkAuthorization";
import checkRequiredField from "../modules/checkRequiredField";
const router = express.Router();

function isValidHexColor(color: string): boolean {
    const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
    return hexColorRegex.test(color);
}

router.get("/", async (req, res) => {
    try {
        const auth = await checkAuthorization(req, res);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        const allowOthers = req.query.allowOthers == "true";

        let reminders;
        let totalReminders

        if (allowOthers) {
            reminders = (await db.query(
                "SELECT * FROM reminders WHERE userid = $1 OR $1 = ANY(sharedWith) LIMIT $2 OFFSET $3",
                [auth.userid, limit, offset]
            )).rows;

            totalReminders = (await db.query(
                "SELECT COUNT(*) FROM reminders WHERE userid = $1 OR $1 = ANY(sharedWith)",
                [auth.userid]
            )).rows[0].count;
        } else {
            reminders = (await db.query(
                "SELECT * FROM reminders WHERE userid = $1 LIMIT $2 OFFSET $3",
                [auth.userid, limit, offset]
            )).rows;

            totalReminders = (await db.query(
                "SELECT COUNT(*) FROM reminders WHERE userid = $1",
                [auth.userid]
            )).rows[0].count;
        }
        
        res.status(200).json({
            reminders,
            page,
            limit,
            totalReminders,
            totalPages: Math.ceil(totalReminders / limit)
        });
    } catch (error) {
        console.error("An error occurred while getting reminders", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/add", async (req, res) => {
    const requiredFields = ["title"];
    const optionalFields = ["description", "color", "priority", "tags", "sharedWith", "time"];
    try {
        const auth = await checkAuthorization(req, res);
        const body = await checkRequiredField(requiredFields, req, res);
        const optionalFieldsQuery = optionalFields.filter(field => field in body && field !== "time").map(field => `${field}`);
        const optionalFieldsValues = optionalFields.filter(field => field in body && field !== "time").map(field => body[field]);
        if ("sharedWith" in body && !Array.isArray(body["sharedWith"])) {
            res.status(400).json({ message: "Invalid sharedWith format, ensure it's an array of user IDs" });
        }
        if ("title" in body && body["title"].length > 256) {
            res.status(400).json({ message: "Title is too long, ensure it's less than 256 characters" });
        }
        if ("description" in body && body["description"].length > 4096) {
            res.status(400).json({ message: "Description is too long, ensure it's less than 4096 characters" });
        }
        if ("priority" in body && !["low", "medium", "high"].includes(body["priority"])) {
            res.status(400).json({ message: "Invalid priority, ensure it's one of low, medium, high" });
        }
        if ("tags" in body && !Array.isArray(body["tags"])) {
            res.status(400).json({ message: "Invalid tags format, ensure it's an array of strings" });
        }
        if ("color" in body && !isValidHexColor(body["color"])) {
            res.status(400).json({ message: "Invalid color format, ensure it's in hex code." });
        }
        if ("time" in body) {
            const parsedTime = chrono.parseDate(body["time"] as string, new Date(), { forwardDate: true })?.toISOString();
            if (!parsedTime) {
                res.status(400).json({ message: "Invalid time format" });
            }
            optionalFieldsQuery.push("time");
            optionalFieldsValues.push(parsedTime);
        }
        const optionalFieldsPlaceholders = optionalFields.filter(field => field in body).map((_, index) => `$${index + 3}`);
        await db.query(`INSERT INTO reminders (userid, title, ${optionalFieldsQuery.join(", ")}) VALUES ($1, $2, ${optionalFieldsPlaceholders.join(", ")})`, [auth.userid, body["title"], ...optionalFieldsValues]);
        res.json({ message: "Reminder added successfully" });
    } catch (error) {
        console.error("An error occured while adding a reminder", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/update/:id", async (req, res) => {
    const optionalFields = ["description", "color", "priority", "tags", "sharedWith", "time"];
    try {
        const auth = await checkAuthorization(req, res);
        const reminder = (await db.query("SELECT * FROM reminders WHERE id = $1", [req.params.id])).rows[0];
        if (reminder.userid !== auth.userid) {
            res.status(403).json({ message: "You are not authorized to update this reminder" });
            return;
        }
        const body = await req.body;
        const optionalFieldsQuery = optionalFields.filter(field => field in body && field !== "time").map(field => `${field}`);
        const optionalFieldsValues = optionalFields.filter(field => field in body && field !== "time").map(field => body[field]);
        if ("time" in body) {
            const parsedTime = chrono.parseDate(body["time"] as string, new Date(), { forwardDate: true })?.toISOString;
            if (!parsedTime) {
                res.status(400).json({ message: "Invalid time format" });
            }
            optionalFieldsQuery.push("time");
            optionalFieldsValues.push(parsedTime);
        }
        await db.query(`UPDATE reminders SET ${optionalFieldsQuery.join(", ")} WHERE id = $1`, [req.params.id, ...optionalFieldsValues]);
        res.json({ message: "Reminder updated successfully" });
    } catch (error) {
        console.error("An error occured while updating a reminder", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const userid = await checkAuthorization(req, res);
        const reminder = (await db.query("SELECT * FROM reminders WHERE id = $1", [req.params.id])).rows[0];
        if (reminder.userid !== userid) {
            res.status(403).json({ message: "You are not authorized to delete this reminder" });
            return;
        }
        await db.query("DELETE FROM reminders WHERE id = $1", [req.params.id]);
        res.json({ message: "Reminder deleted successfully" });
    } catch (error) {
        console.error("An error occured while deleting a reminder", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;