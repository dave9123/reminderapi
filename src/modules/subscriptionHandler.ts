import * as Sentry from "@sentry/node"
import db from "./db";

function HEXToVBColor(rrggbb: string) {
    var bbggrr = rrggbb.substr(4, 2) + rrggbb.substr(2, 2) + rrggbb.substr(0, 2);
    return parseInt(bbggrr, 16);
}

async function sendDiscordWebhook(target: string, message: any) {
    const embed: any = {
        "username": "Reminder Bot",
        "embeds": [
            {
                "title": message.title,
                "footer": {
                    "text": "Made by dave9123",
                    "icon_url": "https://dave9123.pages.dev/assets/img/profile/profile.jpg"
                }
            }
        ],
        "allowed_mentions": {
            "parse": []
        }
    };
    if (message.description) embed.description = message.description
    if (message.color) message.color = HEXToVBColor(message.color.replace("#", ""))
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
    }).then(async (res) => {
        if (await res.status === 200) {
            return true;
        } else {
            return false;
        }
    }).catch((error) => {
        Sentry.captureException(error);
        console.error("An error occurred while sending a Discord webhook", error);
        return false;
    });
}

async function sendSlackWebhook(target: string, message: any) {
    const embed: any = {
        "username": "Reminder Bot",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": message.title,
                    "emoji": true
                }
            }
        ]
    };

    if (message.description) {
        embed.blocks = embed.blocks || [];
        embed.blocks.push({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": message.description
            }
        });
    }
    if (message.priority) {
        embed.blocks = embed.blocks || [];
        embed.blocks.push({
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": `*Priority:*\n${message.priority}`
                }
            ]
        });
    }
    if (message.tags && Array.isArray(message.tags)) {
        embed.blocks = embed.blocks || [];
        embed.blocks.push({
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": `*Tags:*\n${message.tags.join(", ")}`
                }
            ]
        });
    }

    await fetch(target, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(embed)
    }).then(async (res) => {
        if (await res.status === 200) {
            return true;
        } else {
            return false;
        }
    }).catch((error) => {
        Sentry.captureException(error);
        console.error("An error occurred while sending a Slack webhook", error);
        return false;
    });
}

async function sendSubscription(target: string, message: any) {
    try {
        if (target === "discord-webhook") {
            return await sendDiscordWebhook(target, message);
        } else if (target === "slack-webhook") {
            return await sendSlackWebhook(target, message);
        } else {
            throw new Error("Unsupported subscription type");
        }
    } catch (error) {
        Sentry.captureException(error);
        console.error("An error occurred while sending a subscription", error);
        return false;
    }
}

async function handleSubscriptions() {
    try {
        const subscriptions = await db.query(`
            SELECT s.id AS subscription_id, s.target, r.*
            FROM subscriptions s
            JOIN reminders r ON s.userid = r.userid
            LEFT JOIN firedSubscriptions fs ON s.id = fs.subscriptionid
            WHERE fs.subscriptionid IS NULL AND r.time IS NOT NULL AND r.time <= NOW()
        `);

        const remindersByTarget: any = {};
        for (const row of subscriptions.rows) {
            if (!remindersByTarget[row.target]) {
                remindersByTarget[row.target] = [];
            }
            remindersByTarget[row.target].push(row);
        }

        for (const target in remindersByTarget) {
            for (const reminder of remindersByTarget[target]) {
                const successful = await sendSubscription(target, reminder);
                await db.query("INSERT INTO firedSubscriptions (subscriptionid, successful) VALUES ($1, $2)", [reminder.subscription_id, successful]);
            }
        }
    } catch (error) {
        Sentry.captureException(error);
        console.error("An error occurred while processing subscriptions", error);
    }
};

export default function schedule() {
    setInterval(handleSubscriptions, 1 * 60 * 1000);
}