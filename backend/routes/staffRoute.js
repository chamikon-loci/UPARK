import express from "express";

import { getMyParkingLot, getMyParkingSlots, getMyReservations, getMyCurrentParking, changeSlotStatus, checkIn, checkOut, verifyPin, sendAnnouncement } from "../controllers/staff.js";

const router = express.Router();

router.get("/getParkingLot", getMyParkingLot);
router.get("/getParkingSlots", getMyParkingSlots);
router.get("/getReservations", getMyReservations);
router.get("/getCurrentParking", getMyCurrentParking);

router.put("/changeSlotStatus", changeSlotStatus);

router.post("/checkin", checkIn);
router.post("/checkout", checkOut);

router.post("/verifyPin", verifyPin);
router.post("/announcement", sendAnnouncement);

export default router;