import express from "express";

import { joinQueue, getMyQueue,  getParkingLotQueue,callNextQueue, cancelQueue} from "../controllers/queue.js";

const router = express.Router();

router.post("/joinQueue",joinQueue);
router.get("/getMyQueue",getMyQueue);
router.get("/getParkingLotQueue",getParkingLotQueue);
router.post("/callNextQueue",callNextQueue);
router.post("/cancelQueue",cancelQueue);

export default router;