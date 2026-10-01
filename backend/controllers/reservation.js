import pool from "../database/db.js";
import { autoReserveFromQueue } from "./queue.js";

export const reserve = async (req,res) => {
    try {
        const {user_id,car_id,slot_id,start_time,end_time} = req.body;

        if (!start_time || !end_time)
            return res.status(400).json({message:"กรุณาเลือกเวลาเริ่มและเวลาสิ้นสุด"});

        const start = new Date(start_time);
        const end = new Date(end_time);
        const now = new Date();

        if (start >= end)
            return res.status(400).json({message:"เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม"});

        if (start < now)
            return res.status(400).json({message:"ไม่สามารถจองเวลาในอดีตได้"});

        if (start > new Date(now.getTime()+24*60*60*1000))
            return res.status(400).json({message:"สามารถจองล่วงหน้าได้ไม่เกิน 24 ชั่วโมง"});

        const {rows} = await pool.query(`
            SELECT s.parkingSlot_id,s.status,p.parkingLot_id,p.price_per_hour,
                   p.open_time,p.close_time,p.status AS parking_lot_status
            FROM parkingSlots s
            JOIN parkingLots p ON s.parkingLot_id=p.parkingLot_id
            WHERE s.parkingSlot_id=$1
        `,[slot_id]);

        if (!rows.length)
            return res.status(404).json({message:"ไม่พบช่องจอด"});

        const slot = rows[0];

        if (slot.status !== "Available")
            return res.status(400).json({message:"ช่องจอดนี้ไม่ว่าง"});

        if (slot.parking_lot_status !== "Open")
            return res.status(400).json({message:"ลานจอดนี้ปิดให้บริการอยู่"});

        const hours = (end-start)/3600000;

        if (hours < 1)
            return res.status(400).json({message:"ต้องจองอย่างน้อย 1 ชั่วโมง"});

        if (hours > 3)
            return res.status(400).json({message:"จองได้ไม่เกิน 3 ชั่วโมง"});

        const openTime = new Date(start);
        const closeTime = new Date(start);
        const lotOpenTime = new Date(slot.open_time);
        const lotCloseTime = new Date(slot.close_time);

        openTime.setHours(lotOpenTime.getHours(),lotOpenTime.getMinutes(),0,0);
        closeTime.setHours(lotCloseTime.getHours(),lotCloseTime.getMinutes(),0,0);

        if (start < openTime || end > closeTime)
            return res.status(400).json({message:"เวลาที่เลือกอยู่นอกเวลาทำการของลานจอด"});

        const deposit = slot.price_per_hour/2;

        const old = await pool.query(`
            SELECT reservation_id
            FROM reservations
            WHERE user_id=$1 AND vechicle_id=$2
            ORDER BY reservation_id DESC
            LIMIT 1
        `,[user_id,car_id]);

        if (old.rows.length) {
            const check = await pool.query(`
                SELECT *
                FROM check_in_outs
                WHERE reservation_id=$1
            `,[old.rows[0].reservation_id]);

            if (!check.rows.length)
                return res.status(400).json({
                    message:"รถคันนี้มีการจองอยู่แล้ว และยังไม่ได้เข้าจอด"
                });

            if (check.rows[0].check_in_status === "Checked In" &&
                check.rows[0].check_out_status === null)
                return res.status(400).json({
                    message:"รถคันนี้กำลังจอดอยู่ ไม่สามารถจองซ้ำได้"
                });
        }

        const wallet = await pool.query(`
            SELECT *
            FROM wallets
            WHERE user_id=$1
        `,[user_id]);

        if (!wallet.rows.length)
            return res.status(400).json({message:"ไม่พบ Wallet"});

        if (wallet.rows[0].balance < deposit)
            return res.status(400).json({message:"เงินใน Wallet ไม่เพียงพอ"});

        const pinCode = Math.floor(100000+Math.random()*900000).toString();

        const reservation = await pool.query(`
            INSERT INTO reservations
            (user_id,vechicle_id,parkingSlot_id,start_time,end_time,
             total_price,advance_deposit,pin_code,created_at)
            VALUES ($1,$2,$3,$4,$5,0,$6,$7,NOW())
            RETURNING *
        `,[user_id,car_id,slot_id,start_time,end_time,deposit,pinCode]);

        await pool.query(`
            UPDATE parkingSlots
            SET status='Reserved'
            WHERE parkingSlot_id=$1
        `,[slot_id]);

        await pool.query(`
            UPDATE wallets
            SET balance=balance-$1
            WHERE user_id=$2
        `,[deposit,user_id]);

        await pool.query(`
            INSERT INTO transactions
            (wallet_id,transaction_type,amount,created_at)
            VALUES ($1,'Parking Deposit',$2,NOW())
        `,[wallet.rows[0].wallet_id,deposit]);

        const io = req.app.get("io");
        if (io) io.emit("parkingUpdate");

        res.status(201).json({
            message:"จองสำเร็จและชำระเงินมัดจำแล้ว",
            data:reservation.rows[0]
        });
    } catch(error) {
        console.error("Reserve Error:",error);
        res.status(500).json({message:"จองไม่ได้"});
    }
};

export const getReservations = async (req,res) => {
    try {
        const {user_id} = req.query;

        const {rows} = await pool.query(`
            SELECT r.reservation_id,r.pin_code,r.start_time,r.end_time,
                   r.total_price,r.advance_deposit,r.created_at,
                   v.car_brand,v.car_model,v.license_plate,v.province,
                   p.parkingLot_name,p.price_per_hour,
                   s.parkingSlot_name,c.check_in_status,c.check_out_status
            FROM reservations r
            JOIN vechicles v ON r.vechicle_id=v.vechicle_id
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            JOIN parkingLots p ON s.parkingLot_id=p.parkingLot_id
            LEFT JOIN check_in_outs c ON r.reservation_id=c.reservation_id
            WHERE r.user_id=$1
            ORDER BY r.created_at DESC
        `,[user_id]);

        res.json({data:rows});
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"ไม่สามารถดึงข้อมูล Reservation ได้"});
    }
};

export const getParkingHistory = async (req,res) => {
    try {
        const {user_id} = req.query;

        const {rows} = await pool.query(`
            SELECT r.reservation_id,r.start_time,r.end_time,r.advance_deposit,
                   v.car_brand,v.car_model,v.license_plate,
                   p.parkingLot_name,s.parkingSlot_name,
                   c.check_in_status,c.check_out_status,c.check_in_at,c.check_out_at
            FROM reservations r
            JOIN vechicles v ON r.vechicle_id=v.vechicle_id
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            JOIN parkingLots p ON s.parkingLot_id=p.parkingLot_id
            JOIN check_in_outs c ON r.reservation_id=c.reservation_id
            WHERE r.user_id=$1 AND c.check_in_status='Checked In' AND c.check_out_status='Checked Out'
            ORDER BY c.check_out_at DESC
        `,[user_id]);

        res.json({data:rows});
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"ไม่สามารถดึงประวัติการจอดรถได้"});
    }
};

export const cancelReservation = async (req,res) => {
    try {
        const {reservation_id,user_id} = req.body;

        const reservation = await pool.query(`
            SELECT r.*,s.parkingLot_id
            FROM reservations r
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            WHERE r.reservation_id=$1 AND r.user_id=$2
        `,[reservation_id,user_id]);

        if (!reservation.rows.length)
            return res.status(404).json({message:"ไม่พบ Reservation"});

        const data = reservation.rows[0];

        const check = await pool.query(`
            SELECT *
            FROM check_in_outs
            WHERE reservation_id=$1
        `,[reservation_id]);

        if (check.rows.length)
            return res.status(400).json({
                message:"ไม่สามารถยกเลิกได้ เพราะรถเข้าจอดแล้ว"
            });

        const minutesBeforeStart =
            (new Date(data.start_time)-new Date())/60000;

        if (minutesBeforeStart < 60)
            return res.status(400).json({
                message:"ไม่สามารถยกเลิกได้ ต้องยกเลิกก่อนเวลาเริ่มอย่างน้อย 1 ชั่วโมง"
            });

        const wallet = await pool.query(`
            SELECT *
            FROM wallets
            WHERE user_id=$1
        `,[user_id]);

        if (!wallet.rows.length)
            return res.status(400).json({message:"ไม่พบ Wallet"});

        await pool.query(`
            UPDATE wallets
            SET balance=balance+$1
            WHERE user_id=$2
        `,[data.advance_deposit,user_id]);

        await pool.query(`
            INSERT INTO transactions
            (wallet_id,transaction_type,amount,created_at)
            VALUES ($1,'Refund',$2,NOW())
        `,[wallet.rows[0].wallet_id,data.advance_deposit]);

        await pool.query(`
            UPDATE parkingSlots
            SET status='Available'
            WHERE parkingSlot_id=$1
        `,[data.parkingslot_id]);

        await pool.query(`
            DELETE FROM reservations
            WHERE reservation_id=$1
        `,[reservation_id]);

        const io = req.app.get("io");
        if (io) io.emit("parkingUpdate");

        await autoReserveFromQueue(data.parkinglot_id,io);

        res.json({message:"ยกเลิกการจองและคืนเงินสำเร็จ"});
    } catch(error) {
        console.error("Cancel Reservation Error:",error);
        res.status(500).json({message:"ยกเลิกการจองไม่สำเร็จ"});
    }
};

export const getCurrentParking = async (req,res) => {
    try {
        const {user_id} = req.query;

        const {rows} = await pool.query(`
            SELECT r.reservation_id,r.end_time,
                   v.car_brand,v.car_model,v.license_plate,
                   p.parkingLot_name,s.parkingSlot_name,
                   c.check_in_status,c.check_out_status
            FROM reservations r
            JOIN vechicles v ON r.vechicle_id=v.vechicle_id
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            JOIN parkingLots p ON s.parkingLot_id=p.parkingLot_id
            JOIN check_in_outs c ON r.reservation_id=c.reservation_id
            WHERE r.user_id=$1
            AND c.check_in_status='Checked In'
            AND c.check_out_status IS NULL
            LIMIT 1
        `,[user_id]);

        res.json({data:rows[0] ? [rows[0]] : []});
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"ไม่สามารถดึงข้อมูลการจอดรถได้"});
    }
};