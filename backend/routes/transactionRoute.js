import express from "express";
import { getTransactions } from "../controllers/transaction.js";

const router = express.Router();

router.get("/getTransactions", getTransactions);

export default router;