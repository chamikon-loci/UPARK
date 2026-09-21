import express from "express";
import { getallusers, changeRole } from "../controllers/admin.js";

const router = express.Router();

router.get("/getUsers", getallusers);
router.put("/changeRole/:id", changeRole);

export default router;