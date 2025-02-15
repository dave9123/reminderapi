import express from "express";
const router = express.Router();

import createUser from "./user/create";
import deleteUser from "../modules/deleteUser";

router.use("/create", createUser);
router.use("/delete", deleteUser);

export default router;