import dotenv from "dotenv";
dotenv.config();
import fs from "fs";

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