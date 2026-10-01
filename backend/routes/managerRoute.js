import express from "express";

import { getMyParkingLots, changeParkingLotStatus, changePricingPolicy, getMyStaff, addStaff, removeStaff,getReport, getUsageAnalysis, getSatisfactionAnalysis, getRealTimeDashboard } from "../controllers/manager.js";

const router = express.Router();

router.get("/getParkingLots", getMyParkingLots);
router.put("/changeParkingLotStatus", changeParkingLotStatus);
router.put("/changePricingPolicy", changePricingPolicy);

router.get("/getStaff", getMyStaff);
router.post("/addStaff", addStaff);
router.delete("/removeStaff", removeStaff);

router.get("/getReport", getReport);
router.get("/getUsageAnalysis", getUsageAnalysis);
router.get("/getSatisfactionAnalysis", getSatisfactionAnalysis);
router.get("/getRealTimeDashboard", getRealTimeDashboard);

export default router;