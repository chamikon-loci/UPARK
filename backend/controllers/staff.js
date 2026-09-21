import pool from "../database/db.js";

export const getMyParkingLot = async (req, res) => {
    try {
        const { user_id } = req.query;

        const parkingLot = await pool.query(`
            SELECT
                p.parkingLot_id,
                p.parkingLot_name,
                p.latitude,
                p.longitude,
                p.price_per_hour,
                p.open_time,
                p.close_time
            FROM parkingLotStaff ps
            JOIN parkingLots p
                ON ps.parkingLot_id = p.parkingLot_id
            WHERE ps.user_id = $1
        `, [user_id]);

        res.json({
            data: parkingLot.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "ไม่สามารถดึงข้อมูลลานจอดได้"
        });
    }
};

export const getMyParkingSlots = async (req, res) => {
    try {
        const { user_id } = req.query;

        const parkingSlots = await pool.query(`
            SELECT
                s.parkingSlot_id,
                s.parkingSlot_name,
                s.status,
                p.parkingLot_id,
                p.parkingLot_name
            FROM parkingSlots s
            JOIN parkingLots p
                ON s.parkingLot_id = p.parkingLot_id
            JOIN parkingLotStaff ps
                ON p.parkingLot_id = ps.parkingLot_id
            WHERE ps.user_id = $1
            ORDER BY s.parkingSlot_id
        `, [user_id]);

        res.json({
            data: parkingSlots.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "ไม่สามารถดึงข้อมูลช่องจอดได้"
        });
    }
};

export const getMyReservations = async (req, res) => {
    try {
        const { user_id } = req.query;

        const reservations = await pool.query(`
            SELECT
                r.reservation_id,
                r.start_time,
                r.end_time,
                r.total_price,
                r.advance_deposit,
                r.created_at,

                v.car_brand,
                v.car_model,
                v.license_plate,
                v.province,

                p.parkingLot_id,
                p.parkingLot_name,

                s.parkingSlot_id,
                s.parkingSlot_name,

                c.check_in_status,
                c.check_out_status,
                c.check_in_at,
                c.check_out_at

            FROM reservations r
            JOIN vechicles v ON r.vechicle_id = v.vechicle_id
            JOIN parkingSlots s ON r.parkingSlot_id = s.parkingSlot_id
            JOIN parkingLots p ON s.parkingLot_id = p.parkingLot_id
            JOIN parkingLotStaff ps ON p.parkingLot_id = ps.parkingLot_id
            LEFT JOIN check_in_outs c ON r.reservation_id = c.reservation_id

            WHERE ps.user_id = $1

            ORDER BY r.start_time ASC
        `, [user_id]);

        res.json({
            data: reservations.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "ไม่สามารถดึงข้อมูล Reservation ได้"
        });
    }
};

export const getMyCurrentParking = async (req, res) => {
    try {
        const { user_id } = req.query;

        const currentParking = await pool.query(`
            SELECT
                r.reservation_id,
                r.start_time,
                r.end_time,

                v.car_brand,
                v.car_model,
                v.license_plate,
                v.province,

                p.parkingLot_id,
                p.parkingLot_name,

                s.parkingSlot_id,
                s.parkingSlot_name,

                c.check_in_at

            FROM reservations r
            JOIN vechicles v ON r.vechicle_id = v.vechicle_id
            JOIN parkingSlots s ON r.parkingSlot_id = s.parkingSlot_id
            JOIN parkingLots p ON s.parkingLot_id = p.parkingLot_id
            JOIN parkingLotStaff ps ON p.parkingLot_id = ps.parkingLot_id
            JOIN check_in_outs c ON r.reservation_id = c.reservation_id
            WHERE ps.user_id = $1 AND c.check_in_status = 'Checked In' AND c.check_out_status IS NULL
            ORDER BY c.check_in_at ASC
        `, [user_id]);

        res.json({
            data: currentParking.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "ไม่สามารถดึงข้อมูลรถที่กำลังจอดได้"
        });
    }
};

export const changeSlotStatus = async (req, res) => {
    try {
        const { parkingSlot_id, user_id, status } = req.body;

        if (
            status !== "Available" &&
            status !== "Closed"
        ) {
            return res.status(400).json({
                message: "สามารถเปลี่ยนได้เฉพาะ Available และ Closed"
            });
        }

        const slot = await pool.query(`
            SELECT
                s.parkingSlot_id,
                s.status
            FROM parkingSlots s
            JOIN parkingLotStaff ps ON s.parkingLot_id = ps.parkingLot_id
            WHERE s.parkingSlot_id = $1 AND ps.user_id = $2
        `, [
            parkingSlot_id,
            user_id
        ]);

        if (!slot.rows.length) {
            return res.status(404).json({
                message: "ไม่พบช่องจอดหรือคุณไม่ได้รับผิดชอบลานนี้"
            });
        }

        if (
            slot.rows[0].status !== "Available" &&
            slot.rows[0].status !== "Closed"
        ) {
            return res.status(400).json({
                message: "ไม่สามารถเปิดหรือปิดช่องจอดนี้ได้"
            });
        }

        await pool.query(`
            UPDATE parkingSlots
            SET status = $1
            WHERE parkingSlot_id = $2
        `, [
            status,
            parkingSlot_id
        ]);

        res.json({
            message: status === "Closed"
                ? "ปิดช่องจอดสำเร็จ"
                : "เปิดช่องจอดสำเร็จ"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "เปลี่ยนสถานะช่องจอดไม่สำเร็จ"
        });
    }
};

export const checkIn = async (req, res) => {
    try {
        const { license_plate, user_id } = req.body;

        const result = await pool.query(`
            SELECT
                r.reservation_id,
                r.start_time,
                r.end_time,
                r.parkingSlot_id AS parking_slot_id,
                s.parkingLot_id AS parkinglot_id
            FROM reservations r
            JOIN vechicles v ON r.vechicle_id = v.vechicle_id
            JOIN parkingSlots s ON r.parkingSlot_id = s.parkingSlot_id
            WHERE v.license_plate = $1
            ORDER BY r.reservation_id DESC
            LIMIT 1
        `, [license_plate]);

        if (result.rows.length === 0)
            return res.status(404).json({
                message: "ไม่พบ Reservation ของรถคันนี้"
            });

        const reservation = result.rows[0];

        const staff = await pool.query(`
            SELECT parkingLotStaff_id
            FROM parkingLotStaff
            WHERE user_id = $1
            AND parkingLot_id = $2
        `, [
            user_id,
            reservation.parkinglot_id
        ]);

        if (!staff.rows.length)
            return res.status(403).json({
                message: "คุณไม่ได้รับผิดชอบลานจอดนี้"
            });

        if (new Date() < new Date(reservation.start_time))
            return res.status(400).json({
                message: "ยังไม่ถึงเวลา Check In"
            });

        const check = await pool.query(`
            SELECT check_id
            FROM check_in_outs
            WHERE reservation_id = $1
        `, [reservation.reservation_id]);

        if (check.rows.length > 0)
            return res.status(400).json({
                message: "รถคันนี้ Check In ไปแล้ว"
            });

        await pool.query(`
            INSERT INTO check_in_outs
            (reservation_id, check_in_status, check_in_at)
            VALUES ($1, 'Checked In', NOW())
        `, [reservation.reservation_id]);

        await pool.query(`
            UPDATE parkingSlots
            SET status = 'Occupied'
            WHERE parkingSlot_id = $1
        `, [reservation.parking_slot_id]);

        res.json({
            message: "Check In สำเร็จ",
            data: reservation
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Check In ไม่สำเร็จ"
        });
    }
};

export const checkOut = async (req, res) => {
    try {
        const { license_plate, user_id } = req.body;

        const result = await pool.query(`
            SELECT
                r.reservation_id,
                r.parkingSlot_id AS parking_slot_id,
                r.user_id,
                r.start_time,
                r.end_time,
                r.advance_deposit,
                p.price_per_hour,
                c.check_in_at,
                s.parkingLot_id AS parkinglot_id
            FROM reservations r
            JOIN vechicles v ON r.vechicle_id = v.vechicle_id
            JOIN parkingSlots s ON r.parkingSlot_id = s.parkingSlot_id
            JOIN parkingLots p ON s.parkingLot_id = p.parkingLot_id
            JOIN check_in_outs c ON r.reservation_id = c.reservation_id
            WHERE v.license_plate = $1 AND c.check_in_status = 'Checked In' AND c.check_out_status IS NULL
            LIMIT 1
        `, [license_plate]);

        if (result.rows.length === 0)
            return res.status(404).json({
                message: "ไม่พบรถที่กำลังจอดอยู่"
            });

        const car = result.rows[0];

        const staff = await pool.query(`
            SELECT parkingLotStaff_id
            FROM parkingLotStaff
            WHERE user_id = $1
            AND parkingLot_id = $2
        `, [
            user_id,
            car.parkinglot_id
        ]);

        if (!staff.rows.length)
            return res.status(403).json({
                message: "คุณไม่ได้รับผิดชอบลานจอดนี้"
            });

        const now = new Date();
        const endTime = new Date(car.end_time);

        const reservedHours = Math.ceil(
            (new Date(car.end_time) - new Date(car.start_time)) / 3600000
        );

        let overtimeHours = 0;

        if (now > endTime) {
            overtimeHours = Math.ceil(
                (now - endTime) / 3600000
            );
        }

        const total =
            (reservedHours + overtimeHours) *
            car.price_per_hour;

        const remaining = Math.max(
            total - car.advance_deposit,
            0
        );

        const wallet = await pool.query(`
            SELECT wallet_id, balance
            FROM wallets
            WHERE user_id = $1
        `, [car.user_id]);

        if (!wallet.rows.length)
            return res.status(400).json({
                message: "ไม่พบ Wallet"
            });

        if (wallet.rows[0].balance < remaining)
            return res.status(400).json({
                message: "เงินใน Wallet ไม่เพียงพอ"
            });

        if (remaining > 0) {
            await pool.query(`
                UPDATE wallets
                SET balance = balance - $1
                WHERE user_id = $2
            `, [
                remaining,
                car.user_id
            ]);

            await pool.query(`
                INSERT INTO transactions
                (wallet_id, transaction_type, amount, created_at)
                VALUES ($1, 'Parking Fee', $2, NOW())
            `, [
                wallet.rows[0].wallet_id,
                remaining
            ]);
        }

        await pool.query(`
            UPDATE check_in_outs
            SET check_out_status = 'Checked Out',
                check_out_at = NOW()
            WHERE reservation_id = $1
        `, [car.reservation_id]);

        await pool.query(`
            UPDATE parkingSlots
            SET status = 'Available'
            WHERE parkingSlot_id = $1
        `, [car.parking_slot_id]);

        res.json({
            message: "Check Out สำเร็จ",
            reserved_hours: reservedHours,
            overtime_hours: overtimeHours,
            total_price: total,
            advance_deposit: car.advance_deposit,
            remaining: remaining
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Check Out ไม่สำเร็จ"
        });
    }
};