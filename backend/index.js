import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoute from './routes/authRoute.js';
import vechicleRoute from './routes/vechicleRoute.js';
import walletRoute from './routes/walletRoute.js';
import parkingLotRoute from './routes/parkingLotRoute.js';
import reservationRoute from './routes/reservationRoute.js'
import adminRoute from './routes/adminRoute.js'
import staffRoute from './routes/staffRoute.js'
import transactionRoute from "./routes/transactionRoute.js";
import queueRoute from "./routes/queueRoute.js";
import ratingRoute from "./routes/ratingRoute.js";
import managerRoute from "./routes/managerRoute.js";

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
app.use("/api/queue", queueRoute);
app.use("/api/rating", ratingRoute);
app.use("/api/manager", managerRoute);

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
});

app.set("io", io);

io.on("connection", (socket) => {

    console.log("Socket connected:", socket.id);

    socket.on("joinUser", (user_id) => {
        socket.join(`user_${user_id}`);

        console.log(`User ${user_id} joined socket room`);
    });

    socket.on("joinUserRoom", user_id => {
        socket.join(`user_${user_id}`);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });

});

const PORT = process.env.PORT;

httpServer.listen(PORT, () => {
    console.log(`เซิฟเวอร์กำลังทำงานที่พอร์ต ${PORT}`);
});