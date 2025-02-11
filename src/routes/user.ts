import express from "express";
const router = express.Router();

import createUser from "./createUser";
import deleteUser from "../modules/deleteUser";

router.use("/create", createUser);
router.use("/delete", deleteUser);

export default router;