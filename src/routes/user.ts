import express from "express";
import db from "../modules/db";
import checkAuthorization from "../modules/checkAuthorization";
import checkRequiredField from "../modules/checkRequiredField";
const router = express.Router();

router.post("/create", async (req, res) => {
    const requiredFields = ["username", "email", "password"];
    try {
        const body = await checkRequiredField(requiredFields, req, res);
        const { username, email, password } = req.body;
        const user = (await db.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email])).rows[0];
        if (user) {
            res.status(409).json({ message: "User already exists" });
            return;
        }
        await db.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", [username, email, password]);
        res.json({ message: "User created successfully" });
    } catch (error) {
        console.error("An error occured while creating a user", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
router.use("/delete", async (req, res) => {
    const requiredFields = ["session"];
    try {
        const body = await checkAuthorization(req, res);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("An error occured while deleting a user", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;