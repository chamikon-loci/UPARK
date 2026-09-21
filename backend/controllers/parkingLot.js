import pool from "../database/db.js";

export const getParkingLot = async (req, res) => {
    try {
        const { keyword } = req.query;
        const searchResult = await pool.query(`SELECT * FROM parkingLots WHERE parkinglot_name ILIKE $1`, [`%${keyword}%`]);
        if (searchResult.rows.length > 0) {
            return res.status(200).json({data: searchResult.rows});
        }
        return res.status(404).json({
            message: "ไม่พบลานจอด"
        });
    } catch (error) {
        console.error("Search parking lot error:", error);
        return res.status(500).json({
            message: "เกิดข้อผิดพลาดในการค้นหาลานจอด"
        });
    }
};

export const getParkingSlot = async (req, res) => {
    const { id } = req.query;

    const getSlots = await pool.query(`
        SELECT
            s.parkingSlot_id,
            s.parkingSlot_name,
            s.status,
            p.parkingLot_name
        FROM parkingSlots s
        JOIN parkingLots p ON s.parkingLot_id = p.parkingLot_id
        WHERE s.parkingLot_id = $1
    `, [id]);

    if (getSlots.rows.length > 0) {
        return res.status(200).json({
            data: getSlots.rows
        });
    } else {
        return res.status(404).json({
            message: "ไม่พบช่องจอด"
        });
    }
};