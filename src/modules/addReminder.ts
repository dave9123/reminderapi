import doesUserExist from "./doesUserExist";
import db from "./db";
import { v4 as uuidv4 } from "uuid";
import { parse, format, addMinutes } from "date-fns";
import { fromZonedTime as utcToZonedTime, toZonedTime as zonedTimeToUtc } from "date-fns-tz";

interface ReminderData {
    userid: string;
    title: string;
    description: string;
    time: string;
    repeat?: boolean;
    color?: string;
    priority?: string;
    tags?: string[];
    sharedWith?: string[];
    [key: string]: any;
}


const requiredBody = ["userid", "title"];
const optionalBody = ["description", "time", "priority", "color", "tags", "sharedWith"];

export default async function addReminder(body: ReminderData) {
    if (!await doesUserExist(body.userid)) {
        throw new Error("User does not exist");
    } else if (requiredBody.some((key) => !body[key])) {
        throw new Error("Missing required fields");
    } else {
        let reminderTime;
        if (body.time) {
            // Parse time
    
        }        
        let reminderid = uuidv4();
        while ((await db.query("SELECT reminderid FROM reminders WHERE reminderid = $1", [body.reminderid])).rows.length > 0) {
            reminderid = uuidv4();
        }
        return reminderid;
    }
}