import db from "./db";
import checkAuthorization from "./checkAuthorization";
import checkRequiredField from "./checkRequiredField";

function HEXToVBColor(rrggbb) {
    var bbggrr = rrggbb.substr(4, 2) + rrggbb.substr(2, 2) + rrggbb.substr(0, 2);
    return parseInt(bbggrr, 16);
}

async function sendDiscordWebhook(target: string, message: any) {
    const embed:any = JSON.stringify({
        "username": "Reminder Bot",
        "embeds": [
            {
                "title": message.title,
                "description": message.description,
                "color": HEXToVBColor(message.color.replace("#", "")),
                "fields": [
                    {
                        "name": "Priority",
                        "value": message.priority
                    },
                    {
                        "name": "Tags",
                        "value": message.tags.join(", ")
                    }
                ],
                "footer": {
                    "text": "Made by dave9123",
                    "icon_url": "https://dave9123.pages.dev/assets/img/profile/profile.jpg"
                }
            }
        ],
        "allowed_mentions": {
            "parse": []
        }
    });
    if (message.description) message.description = message.description
    if (message.color) message.color = message.color
    if (message.priority) {
        embed.fields = embed.fields || []
        embed.fields.push({
            "name": "Priority",
            "value": message.priority
        })
    }
    if (message.tags) {
        embed.fields = embed.fields || []
        embed.fields.push({
            "name": "Tags",
            "value": message.tags.join(", ")
        })
    }

    await fetch(target, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(embed)
    })
}

async function sendSubscription(target: string, message: any) {
    if (target = "discord-webhook") {
        await sendDiscordWebhook(target, message);
    }
}

async function checkSubscriptions(userid: string, message: any) {
    const subscriptions = (await db.query("SELECT * FROM subscriptions WHERE userid = $1", [userid])).rows;
    for (const subscription of subscriptions) {
        await sendSubscription(subscription.target, message);
    }
}