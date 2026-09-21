import express from "express";

import {
    getMyParkingLot,
    getMyParkingSlots,
    getMyReservations,
    getMyCurrentParking,
    changeSlotStatus,
    checkIn,
    checkOut
} from "../controllers/staff.js";

const router = express.Router();

router.get("/getParkingLot", getMyParkingLot);
router.get("/getParkingSlots", getMyParkingSlots);
router.get("/getReservations", getMyReservations);
router.get("/getCurrentParking", getMyCurrentParking);

router.put("/changeSlotStatus", changeSlotStatus);

router.post("/checkin", checkIn);
router.post("/checkout", checkOut);

export default router;