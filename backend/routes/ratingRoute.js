import express from "express";

import { createRating, getMyRatings, getParkingLotRatings } from "../controllers/rating.js";

const router = express.Router();

router.post("/createRating", createRating);
router.get("/getMyRatings", getMyRatings);
router.get("/getParkingLotRatings", getParkingLotRatings);

export default router;