import * as Sentry from "@sentry/node";
import db from "./db";

function HEXToVBColor(rrggbb: string): number {
    var bbggrr = rrggbb.substr(4, 2) + rrggbb.substr(2, 2) + rrggbb.substr(0, 2);
    return parseInt(bbggrr, 16);
}

async function sendDiscordWebhook(subscription: any) {
    const embed: any = {
        "username": "Reminder Bot",
        "embeds": [
            {
                "title": subscription.title,
                "footer": {
                    "text": `Reminder created <t:${new Date(subscription.createdon)}:R>`
                }
            }
        ],
        "allowed_mentions": {
            "parse": []
        }
    };

    if (subscription.description) {
        embed.embeds[0].description = subscription.description;
    }

    if (subscription.color) {
        embed.embeds[0].color = HEXToVBColor(subscription.color.replace("#", ""));
    }

    if (subscription.priority) {
        embed.embeds[0].fields = embed.embeds[0].fields || [];
        embed.embeds[0].fields.push({
            "name": "Priority",
            "value": subscription.priority
        });
    }

    if (subscription.tags && Array.isArray(subscription.tags)) {
        embed.embeds[0].fields = embed.embeds[0].fields || [];
        embed.embeds[0].fields.push({
            "name": "Tags",
            "value": subscription.tags.join(", ")
        });
    }

    return await fetch(subscription.target, {
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

async function sendSlackWebhook(subscription: any) {
    const embed: any = {
        "username": "Reminder Bot",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": subscription.title,
                    "emoji": true
                }
            }
        ]
    };

    if (subscription.description) {
        embed.blocks.push({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": subscription.description
            }
        });
    }

    if (subscription.tags || subscription.priority) {
        const fields: any[] = [];
        if (subscription.tags && Array.isArray(subscription.tags)) {
            fields.push({
                "type": "mrkdwn",
                "text": `*Tags:*\n${subscription.tags.join(", ")}`
            });
        }
        if (subscription.priority) {
            fields.push({
                "type": "mrkdwn",
                "text": `*Priority:*\n${subscription.priority}`
            });
        }
        embed.blocks.push({
            "type": "section",
            "fields": fields
        });
    }

    return await fetch(subscription.target, {
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

async function sendSubscription(subscription: any) {
    try {
        if (subscription.type === "discord-webhook") {
            return await sendDiscordWebhook(subscription);
        } else if (subscription.type === "slack-webhook") {
            return await sendSlackWebhook(subscription);
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
        console.log("Processing subscriptions...");
        const subscriptions = await db.query(`
            SELECT s.id AS subscription_id, s.target, s.type, r.id AS reminder_id, r.*
            FROM subscriptions s
            JOIN reminders r ON s.userid = r.userid
            LEFT JOIN firedSubscriptions fs ON s.id = fs.subscriptionid AND r.id = fs.reminderid
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
            for (const subscription of remindersByTarget[target]) {
                const successful = await sendSubscription(subscription);
                await db.query("INSERT INTO firedSubscriptions (subscriptionid, reminderid, successful) VALUES ($1, $2, $3)", [subscription.subscription_id, subscription.reminder_id, successful]);
            }
        }
    } catch (error) {
        Sentry.captureException(error);
        console.error("An error occurred while processing subscriptions", error);
    }
}

export default function schedule() {
    setInterval(handleSubscriptions, 30 * 1000);
}