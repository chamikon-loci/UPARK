import express from "express";

import { getUsers, changeRole, getUserActivities, getManagersAndParkingLots, assignManager } from "../controllers/admin.js";

const router = express.Router();

router.get("/getUsers", getUsers);
router.put("/changeRole/:user_id", changeRole);
router.get("/getUserActivities", getUserActivities);

router.get("/getManagersAndParkingLots", getManagersAndParkingLots);
router.put("/assignManager", assignManager);

export default router;