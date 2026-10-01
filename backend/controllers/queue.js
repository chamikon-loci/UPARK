import pool from "../database/db.js";

export const joinQueue = async (req,res) => {
    try {
        const {user_id,vechicle_id,parkingLot_id,start_time,end_time} = req.body;

        if (!user_id || !vechicle_id || !parkingLot_id || !start_time || !end_time)
            return res.status(400).json({message:"ข้อมูลไม่ครบ"});

        const start = new Date(start_time);
        const end = new Date(end_time);
        const now = new Date();

        if (start >= end)
            return res.status(400).json({message:"เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม"});

        if (start < now)
            return res.status(400).json({message:"ไม่สามารถเลือกเวลาในอดีตได้"});

        const hours = (end-start)/3600000;

        if (hours < 1)
            return res.status(400).json({message:"ต้องจองอย่างน้อย 1 ชั่วโมง"});

        if (hours > 3)
            return res.status(400).json({message:"จองได้ไม่เกิน 3 ชั่วโมง"});

        const parkingLot = await pool.query(`
            SELECT parkingLot_id,parkingLot_name,price_per_hour,open_time,close_time,status
            FROM parkingLots
            WHERE parkingLot_id=$1
        `,[parkingLot_id]);

        if (!parkingLot.rows.length)
            return res.status(404).json({message:"ไม่พบลานจอด"});

        if (parkingLot.rows[0].status !== "Open")
            return res.status(400).json({message:"ลานจอดนี้ปิดให้บริการอยู่"});

        const car = await pool.query(`
            SELECT *
            FROM vechicles
            WHERE vechicle_id=$1 AND user_id=$2
        `,[vechicle_id,user_id]);

        if (!car.rows.length)
            return res.status(404).json({message:"ไม่พบรถของคุณ"});

        const oldQueue = await pool.query(`
            SELECT queue_id
            FROM queues
            WHERE user_id=$1 AND vechicle_id=$2 AND parkingLot_id=$3
            AND status IN ('Waiting','Called')
        `,[user_id,vechicle_id,parkingLot_id]);

        if (oldQueue.rows.length)
            return res.status(400).json({message:"รถคันนี้อยู่ใน Queue แล้ว"});

        const availableSlot = await pool.query(`
            SELECT parkingSlot_id
            FROM parkingSlots
            WHERE parkingLot_id=$1 AND status='Available'
            LIMIT 1
        `,[parkingLot_id]);

        if (availableSlot.rows.length)
            return res.status(400).json({message:"ตอนนี้มีช่องว่าง สามารถจองได้ทันที"});

        const queueCount = await pool.query(`
            SELECT COUNT(*) AS count
            FROM queues
            WHERE parkingLot_id=$1 AND status='Waiting'
        `,[parkingLot_id]);

        const queueNumber = Number(queueCount.rows[0].count)+1;
        const queueDeposit = 50;

        const wallet = await pool.query(`
            SELECT wallet_id,balance
            FROM wallets
            WHERE user_id=$1
        `,[user_id]);

        if (!wallet.rows.length)
            return res.status(400).json({message:"ไม่พบ Wallet"});

        if (wallet.rows[0].balance < queueDeposit)
            return res.status(400).json({message:"เงินใน Wallet ไม่เพียงพอสำหรับ Queue"});

        const queue = await pool.query(`
            INSERT INTO queues
            (user_id,vechicle_id,parkingLot_id,queue_number,advance_deposit,
             start_time,end_time,status,created_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,'Waiting',NOW())
            RETURNING *
        `,[user_id,vechicle_id,parkingLot_id,queueNumber,queueDeposit,start_time,end_time]);

        await pool.query(`
            UPDATE wallets
            SET balance=balance-$1
            WHERE user_id=$2
        `,[queueDeposit,user_id]);

        await pool.query(`
            INSERT INTO transactions
            (wallet_id,transaction_type,amount,created_at)
            VALUES ($1,'Queue Deposit',$2,NOW())
        `,[wallet.rows[0].wallet_id,queueDeposit]);

        res.status(201).json({
            message:`เข้าคิวสำเร็จ คุณอยู่คิวที่ ${queueNumber}`,
            data:queue.rows[0]
        });
    } catch(error) {
        console.error("Join Queue Error:",error);
        res.status(500).json({message:"เข้าคิวไม่สำเร็จ"});
    }
};

export const getMyQueue = async (req,res) => {
    try {
        const {user_id} = req.query;

        const {rows} = await pool.query(`
            SELECT q.queue_id,q.queue_number,q.advance_deposit,q.start_time,
                   q.end_time,q.status,q.created_at,v.car_brand,v.car_model,
                   v.license_plate,v.province,p.parkingLot_id,p.parkingLot_name
            FROM queues q
            JOIN vechicles v ON q.vechicle_id=v.vechicle_id
            JOIN parkingLots p ON q.parkingLot_id=p.parkingLot_id
            WHERE q.user_id=$1
            ORDER BY q.created_at DESC
        `,[user_id]);

        res.json({data:rows});
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"ไม่สามารถดึงข้อมูล Queue ได้"});
    }
};

export const getParkingLotQueue = async (req,res) => {
    try {
        const {user_id} = req.query;

        const {rows} = await pool.query(`
            SELECT q.queue_id,q.queue_number,q.advance_deposit,q.start_time,
                   q.end_time,q.status,q.created_at,v.car_brand,v.car_model,
                   v.license_plate,p.parkingLot_id,p.parkingLot_name
            FROM queues q
            JOIN vechicles v ON q.vechicle_id=v.vechicle_id
            JOIN parkingLots p ON q.parkingLot_id=p.parkingLot_id
            JOIN parkingLotStaff ps ON p.parkingLot_id=ps.parkingLot_id
            WHERE ps.user_id=$1 AND q.status='Waiting'
            ORDER BY q.queue_number ASC
        `,[user_id]);

        res.json({data:rows});
    } catch(error) {
        console.error(error);
        res.status(500).json({
            message:"ไม่สามารถดึงข้อมูล Queue ของลานจอดได้"
        });
    }
};

export const autoReserveFromQueue = async (parkingLot_id,io) => {
    try {
        const slot = await pool.query(`
            SELECT parkingSlot_id
            FROM parkingSlots
            WHERE parkingLot_id=$1 AND status='Available'
            ORDER BY parkingSlot_id
            LIMIT 1
        `,[parkingLot_id]);

        if (!slot.rows.length)
            return null;

        const queue = await pool.query(`
            SELECT q.*,p.parkingLot_name,p.price_per_hour
            FROM queues q
            JOIN parkingLots p ON q.parkingLot_id=p.parkingLot_id
            WHERE q.parkingLot_id=$1 AND q.status='Waiting'
            ORDER BY q.queue_number ASC
            LIMIT 1
        `,[parkingLot_id]);

        if (!queue.rows.length)
            return null;

        const data = queue.rows[0];
        const parkingSlot_id = slot.rows[0].parkingslot_id;
        const start = new Date(data.start_time);
        const end = new Date(data.end_time);
        const now = new Date();

        if (start < now) {
            await pool.query(`
                UPDATE queues
                SET status='Cancelled'
                WHERE queue_id=$1
            `,[data.queue_id]);

            const wallet = await pool.query(`
                SELECT wallet_id
                FROM wallets
                WHERE user_id=$1
            `,[data.user_id]);

            if (wallet.rows.length) {
                await pool.query(`
                    UPDATE wallets
                    SET balance=balance+$1
                    WHERE user_id=$2
                `,[data.advance_deposit,data.user_id]);

                await pool.query(`
                    INSERT INTO transactions
                    (wallet_id,transaction_type,amount,created_at)
                    VALUES ($1,'Queue Refund',$2,NOW())
                `,[wallet.rows[0].wallet_id,data.advance_deposit]);
            }

            await reorderQueue(data.parkinglot_id);

            if (io)
                io.to(`user_${data.user_id}`).emit(
                    "queueAutoReserveFailed",
                    {
                        queue_id:data.queue_id,
                        message:"เวลาที่เลือกสำหรับ Queue ผ่านไปแล้ว ระบบคืนเงิน Queue Deposit ให้แล้ว"
                    }
                );

            return null;
        }

        const hours = (end-start)/3600000;

        if (hours < 1 || hours > 3)
            return null;

        const totalPrice = hours*data.price_per_hour;
        const requiredDeposit = data.price_per_hour/2;
        const queueDeposit = Number(data.advance_deposit);
        const extraDeposit = Math.max(requiredDeposit-queueDeposit,0);

        const wallet = await pool.query(`
            SELECT wallet_id,balance
            FROM wallets
            WHERE user_id=$1
        `,[data.user_id]);

        if (!wallet.rows.length) {
            if (io)
                io.to(`user_${data.user_id}`).emit(
                    "queueAutoReserveFailed",
                    {
                        queue_id:data.queue_id,
                        message:"ไม่พบ Wallet"
                    }
                );

            return null;
        }

        if (wallet.rows[0].balance < extraDeposit) {
            if (io)
                io.to(`user_${data.user_id}`).emit(
                    "queueAutoReserveFailed",
                    {
                        queue_id:data.queue_id,
                        queue_number:data.queue_number,
                        message:"ถึงคิวแล้ว แต่เงินใน Wallet ไม่เพียงพอสำหรับส่วนต่าง"
                    }
                );

            return null;
        }

        const pinCode = Math.floor(100000+Math.random()*900000).toString();

        const reservation = await pool.query(`
            INSERT INTO reservations
            (user_id,vechicle_id,parkingSlot_id,start_time,end_time,
             total_price,advance_deposit,pin_code,created_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
            RETURNING reservation_id
        `,[
            data.user_id,
            data.vechicle_id,
            parkingSlot_id,
            data.start_time,
            data.end_time,
            totalPrice,
            queueDeposit+extraDeposit,
            pinCode
        ]);

        if (extraDeposit > 0) {
            await pool.query(`
                UPDATE wallets
                SET balance=balance-$1
                WHERE user_id=$2
            `,[extraDeposit,data.user_id]);

            await pool.query(`
                INSERT INTO transactions
                (wallet_id,transaction_type,amount,created_at)
                VALUES ($1,'Parking Deposit',$2,NOW())
            `,[wallet.rows[0].wallet_id,extraDeposit]);
        }

        await pool.query(`
            UPDATE parkingSlots
            SET status='Reserved'
            WHERE parkingSlot_id=$1
        `,[parkingSlot_id]);

        await pool.query(`
            UPDATE queues
            SET status='Completed'
            WHERE queue_id=$1
        `,[data.queue_id]);

        await reorderQueue(data.parkinglot_id);

        if (io) {
            io.emit("parkingUpdate");
            io.to(`user_${data.user_id}`).emit(
                "queueAutoReserved",
                {
                    queue_id:data.queue_id,
                    queue_number:data.queue_number,
                    reservation_id:reservation.rows[0].reservation_id,
                    parkingLot_id:data.parkinglot_id,
                    parkingLot_name:data.parkinglot_name,
                    parkingSlot_id,
                    start_time:data.start_time,
                    end_time:data.end_time,
                    total_price:totalPrice,
                    advance_deposit:queueDeposit+extraDeposit,
                    pin_code:pinCode,
                    message:`ระบบจองช่องจอดให้อัตโนมัติแล้ว คิวหมายเลข ${data.queue_number}`
                }
            );
        }

        return reservation.rows[0];
    } catch(error) {
        console.error("Auto Reserve Queue Error:",error);
        return null;
    }
};

export const callNextQueue = async (req,res) => {
    try {
        const {user_id} = req.body;

        const parkingLot = await pool.query(`
            SELECT parkingLot_id
            FROM parkingLotStaff
            WHERE user_id=$1
            LIMIT 1
        `,[user_id]);

        if (!parkingLot.rows.length)
            return res.status(403).json({
                message:"คุณไม่ได้รับผิดชอบลานจอดใด"
            });

        const io = req.app.get("io");

        const result = await autoReserveFromQueue(
            parkingLot.rows[0].parkinglot_id,
            io
        );

        if (!result)
            return res.status(404).json({
                message:"ยังไม่สามารถ Auto Reserve ได้"
            });

        res.json({
            message:"Auto Reserve สำเร็จ",
            data:result
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"Auto Reserve ไม่สำเร็จ"});
    }
};

export const cancelQueue = async (req,res) => {
    try {
        const {queue_id,user_id} = req.body;

        const queue = await pool.query(`
            SELECT *
            FROM queues
            WHERE queue_id=$1 AND user_id=$2
        `,[queue_id,user_id]);

        if (!queue.rows.length)
            return res.status(404).json({message:"ไม่พบ Queue"});

        const data = queue.rows[0];

        if (data.status !== "Waiting")
            return res.status(400).json({
                message:"ไม่สามารถยกเลิก Queue นี้ได้"
            });

        const wallet = await pool.query(`
            SELECT wallet_id
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
            VALUES ($1,'Queue Refund',$2,NOW())
        `,[wallet.rows[0].wallet_id,data.advance_deposit]);

        await pool.query(`
            UPDATE queues
            SET status='Cancelled'
            WHERE queue_id=$1
        `,[queue_id]);

        await reorderQueue(data.parkinglot_id);

        res.json({message:"ยกเลิก Queue และคืนเงินมัดจำสำเร็จ"});
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"ยกเลิก Queue ไม่สำเร็จ"});
    }
};

const reorderQueue = async parkingLot_id => {
    const {rows} = await pool.query(`
        SELECT queue_id
        FROM queues
        WHERE parkingLot_id=$1 AND status='Waiting'
        ORDER BY created_at ASC
    `,[parkingLot_id]);

    for (let i=0;i<rows.length;i++)
        await pool.query(`
            UPDATE queues
            SET queue_number=$1
            WHERE queue_id=$2
        `,[i+1,rows[i].queue_id]);
};