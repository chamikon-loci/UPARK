import pool from "../database/db.js";

export const getUsers = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT user_id, username, email, role_name
            FROM users
            ORDER BY user_id
        `);

        res.json({ data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "ไม่สามารถดึงข้อมูลผู้ใช้ได้"
        });
    }
};

export const changeRole = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({
                message: "กรุณาระบุ Role"
            });
        }

        await pool.query(`
            UPDATE users
            SET role_name = $1
            WHERE user_id = $2
        `, [role, user_id]);

        res.json({
            message: "เปลี่ยน Role สำเร็จ"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "ไม่สามารถเปลี่ยน Role ได้"
        });
    }
};

export const getUserActivities = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT r.user_id,u.username,'Reservation' AS activity_type,
                   r.reservation_id::TEXT AS reference_id,
                   CONCAT('จองที่จอด ',p.parkingLot_name,
                          ' ช่อง ',s.parkingSlot_name) AS description,
                   r.created_at AS activity_time
            FROM reservations r
            JOIN users u ON r.user_id=u.user_id
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            JOIN parkingLots p ON s.parkingLot_id=p.parkingLot_id

            UNION ALL

            SELECT r.user_id,u.username,'Check In' AS activity_type,
                   r.reservation_id::TEXT AS reference_id,
                   CONCAT('Check-in ที่ ',p.parkingLot_name,
                          ' ช่อง ',s.parkingSlot_name) AS description,
                   c.check_in_at AS activity_time
            FROM check_in_outs c
            JOIN reservations r ON c.reservation_id=r.reservation_id
            JOIN users u ON r.user_id=u.user_id
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            JOIN parkingLots p ON s.parkingLot_id=p.parkingLot_id
            WHERE c.check_in_at IS NOT NULL

            UNION ALL

            SELECT r.user_id,u.username,'Check Out' AS activity_type,
                   r.reservation_id::TEXT AS reference_id,
                   CONCAT('Check-out จาก ',p.parkingLot_name,
                          ' ช่อง ',s.parkingSlot_name) AS description,
                   c.check_out_at AS activity_time
            FROM check_in_outs c
            JOIN reservations r ON c.reservation_id=r.reservation_id
            JOIN users u ON r.user_id=u.user_id
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            JOIN parkingLots p ON s.parkingLot_id=p.parkingLot_id
            WHERE c.check_out_at IS NOT NULL

            UNION ALL

            SELECT w.user_id,u.username,'Transaction' AS activity_type,
                   t.transaction_id::TEXT AS reference_id,
                   CONCAT(t.transaction_type,' จำนวน ',
                          t.amount,' บาท') AS description,
                   t.created_at AS activity_time
            FROM transactions t
            JOIN wallets w ON t.wallet_id=w.wallet_id
            JOIN users u ON w.user_id=u.user_id

            UNION ALL

            SELECT q.user_id,u.username,'Queue' AS activity_type,
                   q.queue_id::TEXT AS reference_id,
                   CONCAT('เข้าคิวหมายเลข ',q.queue_number,
                          ' สถานะ ',q.status) AS description,
                   q.created_at AS activity_time
            FROM queues q
            JOIN users u ON q.user_id=u.user_id

            ORDER BY activity_time DESC
        `);

        res.json({ data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "ไม่สามารถดึงประวัติการใช้งานได้"
        });
    }
};

export const getManagersAndParkingLots = async (req, res) => {
    try {
        const managers = await pool.query(`
            SELECT 
                user_id,
                username,
                email
            FROM users
            WHERE role_name = 'Manager'
            ORDER BY user_id
        `);

        const parkingLots = await pool.query(`
            SELECT 
                parkinglot_id AS "parkingLot_id",
                parkinglot_name AS "parkingLot_name"
            FROM parkinglots
            ORDER BY parkinglot_id
        `);

        const assignments = await pool.query(`
            SELECT 
                pm.parkinglotmanager_id AS "parkingLotManager_id",
                pm.user_id,
                pm.parkinglot_id AS "parkingLot_id",
                u.username,
                p.parkinglot_name AS "parkingLot_name"
            FROM parkinglotmanagers pm
            JOIN users u ON pm.user_id = u.user_id
            JOIN parkinglots p ON pm.parkinglot_id = p.parkinglot_id
            ORDER BY pm.parkinglotmanager_id
        `);

        res.json({
            managers: managers.rows,
            parkingLots: parkingLots.rows,
            assignments: assignments.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "ไม่สามารถดึงข้อมูล Manager และลานจอดได้"
        });
    }
};

export const assignManager = async (req, res) => {
    try {
        const { user_id, parkingLot_id } = req.body;

        if (!user_id || !parkingLot_id) {
            return res.status(400).json({
                message: "กรุณาเลือก Manager และลานจอด"
            });
        }

        const manager = await pool.query(`
            SELECT user_id
            FROM users
            WHERE user_id = $1
            AND role_name = 'Manager'
        `, [user_id]);

        if (manager.rows.length === 0) {
            return res.status(400).json({
                message: "ผู้ใช้คนนี้ไม่ใช่ Manager"
            });
        }

        const existing = await pool.query(`
            SELECT parkingLotManager_id
            FROM parkingLotManagers
            WHERE user_id = $1
        `, [user_id]);

        if (existing.rows.length > 0) {
            await pool.query(`
                UPDATE parkingLotManagers
                SET parkingLot_id = $1
                WHERE user_id = $2
            `, [parkingLot_id, user_id]);
        } else {
            await pool.query(`
                INSERT INTO parkingLotManagers (user_id, parkingLot_id)
                VALUES ($1, $2)
            `, [user_id, parkingLot_id]);
        }

        res.json({
            message: "มอบหมายลานจอดให้ Manager สำเร็จ"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "ไม่สามารถมอบหมายลานจอดได้"
        });
    }
};