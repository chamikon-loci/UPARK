import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoute from './routes/authRoute.js';
import vechicleRoute from './routes/vechicleRoute.js';
import walletRoute from './routes/walletRoute.js';
import parkingLotRoute from './routes/parkingLotRoute.js';
import reservationRoute from './routes/reservationRoute.js'
import adminRoute from './routes/adminRoute.js'
import staffRoute from './routes/staffRoute.js'
import transactionRoute from "./routes/transactionRoute.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use('/api/auth', authRoute);
app.use('/api/vechicle', vechicleRoute);
app.use('/api/wallet', walletRoute);
app.use('/api/parkingLot', parkingLotRoute);
app.use('/api/reservation', reservationRoute)
app.use('/api/admin', adminRoute)
app.use("/api/staff", staffRoute);
app.use("/api/transaction", transactionRoute);

const PORT = process.env.PORT;
app.listen(PORT, (req,res) => {
    console.log(`เซิฟเวอร์กำลังทำงานที่พอร์ต ${PORT}`);
});