import express from "express";
import db from "../modules/db";
import checkAuthorization from "../modules/checkAuthorization";
import checkRequiredField from "../modules/checkRequiredField";
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const userid = await checkAuthorization(req, res);
        const reminders = (await db.query("SELECT * FROM reminders WHERE userid = $1 OR $1 = ANY(sharedWith)", [userid])).rows;
        res.json(reminders);
    } catch (error) {
        console.error("An error occured while getting reminders", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/add", async (req, res) => {
    const requiredFields = ["title"];
    const optionalFields = ["description", "time", "color", "priority", "tags", "sharedWith"];
    try {
        const userid = await checkAuthorization(req, res);
        const body = checkRequiredField(requiredFields, req, res);
        const optionalFieldsQuery = optionalFields.filter(field => field in body).map(field => `${field} = $${field}`);
        const optionalFieldsValues = optionalFields.filter(field => field in body).map(field => body[field]);
        const query = `INSERT INTO reminders (userid, ${requiredFields.concat(optionalFields).join(", ")}) VALUES ($1, $2, $3, $4${optionalFieldsQuery.length > 0 ? `, ${optionalFieldsQuery.join(", ")}` : ""})`;
        const values = [userid, body.title, body.description, body.time, body.color, body.priority, body.tags, body.sharedWith, ...optionalFieldsValues];
        await db.query(query, values);
        res.json({ message: "Reminder added successfully" });        
    } catch (error) {
        console.error("An error occured while adding a reminder", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;