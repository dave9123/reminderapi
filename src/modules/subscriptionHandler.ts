import db from "./db";
import checkAuthorization from "./checkAuthorization";
import checkRequiredField from "./checkRequiredField";

async function sendDiscordWebhook(target: string, message: any) {
    await fetch(target, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "username": "Reminder Bot",
            "embeds": [
                {
                    "title": message.title,
                    "description": message.description,
                    "color": parseInt(message.color.replace("#", ""), 16),
                }
            ],
            "allowed_mentions": {
                "parse": []
            }
        })
    })
}