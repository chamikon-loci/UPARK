import pool from "../database/db.js";

export const createRating = async (req, res) => {
    try {
        const { user_id,reservation_id,score,comment } = req.body;

        if (!user_id || !reservation_id || !score)
            return res.status(400).json({ message: "ข้อมูลไม่ครบ" });

        if (score < 1 || score > 5)
            return res.status(400).json({ message: "คะแนนต้องอยู่ระหว่าง 1 - 5" });

        const reservation = await pool.query(`
            SELECT r.reservation_id,r.user_id,c.check_out_status
            FROM reservations r
            JOIN check_in_outs c ON r.reservation_id=c.reservation_id
            WHERE r.reservation_id=$1 AND r.user_id=$2
        `, [reservation_id,user_id]);

        if (!reservation.rows.length)
            return res.status(404).json({ message: "ไม่พบ Reservation" });

        const data = reservation.rows[0];

        if (data.check_out_status !== "Checked Out")
            return res.status(400).json({
                message: "สามารถให้คะแนนได้หลัง Check Out เท่านั้น"
            });

        const oldRating = await pool.query(`
            SELECT rating_id FROM ratings
            WHERE reservation_id=$1
        `, [reservation_id]);

        if (oldRating.rows.length)
            return res.status(400).json({
                message: "Reservation นี้ให้คะแนนไปแล้ว"
            });

        const rating = await pool.query(`
            INSERT INTO ratings
            (user_id,reservation_id,score,comment,created_at)
            VALUES ($1,$2,$3,$4,NOW())
            RETURNING *
        `, [user_id,reservation_id,score,comment || null]);

        res.status(201).json({
            message: "ให้คะแนนสำเร็จ",
            data: rating.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "ให้คะแนนไม่สำเร็จ" });
    }
};

export const getMyRatings = async (req, res) => {
    try {
        const { user_id } = req.query;

        const { rows } = await pool.query(`
            SELECT r.rating_id,r.reservation_id,r.score,r.comment,r.created_at,
                   p.parkingLot_name,s.parkingSlot_name
            FROM ratings r
            JOIN reservations rv ON r.reservation_id=rv.reservation_id
            JOIN parkingSlots s ON rv.parkingSlot_id=s.parkingSlot_id
            JOIN parkingLots p ON s.parkingLot_id=p.parkingLot_id
            WHERE r.user_id=$1
            ORDER BY r.created_at DESC
        `, [user_id]);

        res.json({ data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "ไม่สามารถดึง Rating ได้" });
    }
};

export const getParkingLotRatings = async (req, res) => {
    try {
        const { parkingLot_id } = req.query;

        const { rows } = await pool.query(`
            SELECT r.rating_id,r.score,r.comment,r.created_at,
                   rv.reservation_id,v.license_plate
            FROM ratings r
            JOIN reservations rv ON r.reservation_id=rv.reservation_id
            JOIN parkingSlots s ON rv.parkingSlot_id=s.parkingSlot_id
            JOIN vechicles v ON rv.vechicle_id=v.vechicle_id
            WHERE s.parkingLot_id=$1
            ORDER BY r.created_at DESC
        `, [parkingLot_id]);

        res.json({ data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "ไม่สามารถดึง Rating ของลานจอดได้"
        });
    }
};