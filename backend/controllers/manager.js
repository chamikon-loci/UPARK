import pool from "../database/db.js";

export const getMyParkingLots = async (req,res) => {
    try {
        const {user_id} = req.query;

        const {rows} = await pool.query(`
            SELECT p.parkingLot_id,p.parkingLot_name,p.latitude,p.longitude,
                   p.price_per_hour,p.open_time,p.close_time,p.status
            FROM parkingLots p
            JOIN parkingLotManagers pm ON p.parkingLot_id=pm.parkingLot_id
            WHERE pm.user_id=$1
            ORDER BY p.parkingLot_id
        `,[user_id]);

        res.json({data:rows});
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"ไม่สามารถดึงข้อมูลลานจอดได้"});
    }
};

export const changeParkingLotStatus = async (req,res) => {
    try {
        const {parkingLot_id,user_id,status} = req.body;

        if (!["Open","Closed"].includes(status))
            return res.status(400).json({message:"สถานะไม่ถูกต้อง"});

        const parkingLot = await pool.query(`
            SELECT p.parkingLot_id
            FROM parkingLots p
            JOIN parkingLotManagers pm ON p.parkingLot_id=pm.parkingLot_id
            WHERE p.parkingLot_id=$1 AND pm.user_id=$2
        `,[parkingLot_id,user_id]);

        if (!parkingLot.rows.length)
            return res.status(403).json({
                message:"คุณไม่ได้เป็น Manager ของลานจอดนี้"
            });

        await pool.query(`
            UPDATE parkingLots
            SET status=$1
            WHERE parkingLot_id=$2
        `,[status,parkingLot_id]);

        res.json({
            message:status==="Open" ? "เปิดลานจอดสำเร็จ" : "ปิดลานจอดสำเร็จ"
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"เปลี่ยนสถานะลานจอดไม่สำเร็จ"});
    }
};

export const changePricingPolicy = async (req,res) => {
    try {
        const {parkingLot_id,user_id,price_per_hour} = req.body;

        if (price_per_hour===undefined || price_per_hour===null || price_per_hour<=0)
            return res.status(400).json({message:"ราคาต้องมากกว่า 0"});

        const parkingLot = await pool.query(`
            SELECT p.parkingLot_id
            FROM parkingLots p
            JOIN parkingLotManagers pm ON p.parkingLot_id=pm.parkingLot_id
            WHERE p.parkingLot_id=$1 AND pm.user_id=$2
        `,[parkingLot_id,user_id]);

        if (!parkingLot.rows.length)
            return res.status(403).json({
                message:"คุณไม่ได้เป็น Manager ของลานจอดนี้"
            });

        await pool.query(`
            UPDATE parkingLots
            SET price_per_hour=$1
            WHERE parkingLot_id=$2
        `,[price_per_hour,parkingLot_id]);

        res.json({message:"เปลี่ยนราคาสำเร็จ"});
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"เปลี่ยนราคาไม่สำเร็จ"});
    }
};

export const getMyStaff = async (req,res) => {
    try {
        const {user_id,parkingLot_id} = req.query;

        const manager = await pool.query(`
            SELECT *
            FROM parkingLotManagers
            WHERE user_id=$1 AND parkingLot_id=$2
        `,[user_id,parkingLot_id]);

        if (!manager.rows.length)
            return res.status(403).json({
                message:"คุณไม่ได้เป็น Manager ของลานจอดนี้"
            });

        const staff = await pool.query(`
            SELECT u.user_id,u.username,u.email,ps.parkingLotStaff_id
            FROM parkingLotStaff ps
            JOIN users u ON ps.user_id=u.user_id
            WHERE ps.parkingLot_id=$1
            ORDER BY u.user_id
        `,[parkingLot_id]);

        const availableStaff = await pool.query(`
            SELECT u.user_id,u.username,u.email
            FROM users u
            WHERE u.role_name='Staff'
            AND u.user_id NOT IN (
                SELECT user_id
                FROM parkingLotStaff
                WHERE parkingLot_id=$1
            )
            ORDER BY u.user_id
        `,[parkingLot_id]);

        res.json({
            data:staff.rows,
            availableStaff:availableStaff.rows
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"ไม่สามารถดึงข้อมูล Staff ได้"});
    }
};

export const addStaff = async (req,res) => {
    try {
        const {manager_id,user_id,parkingLot_id} = req.body;

        const manager = await pool.query(`
            SELECT *
            FROM parkingLotManagers
            WHERE user_id=$1 AND parkingLot_id=$2
        `,[manager_id,parkingLot_id]);

        if (!manager.rows.length)
            return res.status(403).json({
                message:"คุณไม่ได้เป็น Manager ของลานจอดนี้"
            });

        const user = await pool.query(`
            SELECT *
            FROM users
            WHERE user_id=$1 AND role_name='Staff'
        `,[user_id]);

        if (!user.rows.length)
            return res.status(404).json({message:"ไม่พบ Staff"});

        const oldStaff = await pool.query(`
            SELECT *
            FROM parkingLotStaff
            WHERE user_id=$1 AND parkingLot_id=$2
        `,[user_id,parkingLot_id]);

        if (oldStaff.rows.length)
            return res.status(400).json({
                message:"User นี้เป็น Staff ของลานนี้อยู่แล้ว"
            });

        await pool.query(`
            INSERT INTO parkingLotStaff(user_id,parkingLot_id)
            VALUES($1,$2)
        `,[user_id,parkingLot_id]);

        res.status(201).json({message:"เพิ่ม Staff สำเร็จ"});
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"เพิ่ม Staff ไม่สำเร็จ"});
    }
};

export const removeStaff = async (req,res) => {
    try {
        const {manager_id,user_id,parkingLot_id} = req.body;

        const manager = await pool.query(`
            SELECT *
            FROM parkingLotManagers
            WHERE user_id=$1 AND parkingLot_id=$2
        `,[manager_id,parkingLot_id]);

        if (!manager.rows.length)
            return res.status(403).json({
                message:"คุณไม่ได้เป็น Manager ของลานจอดนี้"
            });

        const staff = await pool.query(`
            SELECT *
            FROM parkingLotStaff
            WHERE user_id=$1 AND parkingLot_id=$2
        `,[user_id,parkingLot_id]);

        if (!staff.rows.length)
            return res.status(404).json({
                message:"ไม่พบ Staff ในลานจอดนี้"
            });

        await pool.query(`
            DELETE FROM parkingLotStaff
            WHERE user_id=$1 AND parkingLot_id=$2
        `,[user_id,parkingLot_id]);

        res.json({message:"ลบ Staff สำเร็จ"});
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"ลบ Staff ไม่สำเร็จ"});
    }
};

export const getReport = async (req,res) => {
    try {
        const {user_id,parkingLot_id} = req.query;

        const manager = await pool.query(`
            SELECT *
            FROM parkingLotManagers
            WHERE user_id=$1 AND parkingLot_id=$2
        `,[user_id,parkingLot_id]);

        if (!manager.rows.length)
            return res.status(403).json({
                message:"คุณไม่ได้เป็น Manager ของลานจอดนี้"
            });

        const reservations = await pool.query(`
            SELECT COUNT(*) AS total
            FROM reservations r
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            WHERE s.parkingLot_id=$1
        `,[parkingLot_id]);

        const completedReservations = await pool.query(`
            SELECT COUNT(*) AS total
            FROM reservations r
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            JOIN check_in_outs c ON r.reservation_id=c.reservation_id
            WHERE s.parkingLot_id=$1 AND c.check_in_status='Checked In' AND c.check_out_status='Checked Out'
        `,[parkingLot_id]);

        const currentParking = await pool.query(`
            SELECT COUNT(*) AS total
            FROM reservations r
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            JOIN check_in_outs c ON r.reservation_id=c.reservation_id
            WHERE s.parkingLot_id=$1 AND c.check_in_status='Checked In' AND c.check_out_status IS NULL
        `,[parkingLot_id]);

        const queue = await pool.query(`
            SELECT COUNT(*) AS total
            FROM queues
            WHERE parkingLot_id=$1 AND status='Waiting'
        `,[parkingLot_id]);

        const revenue = await pool.query(`
            SELECT COALESCE(SUM(r.total_price),0) AS total
            FROM reservations r
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            JOIN check_in_outs c ON r.reservation_id=c.reservation_id
            WHERE s.parkingLot_id=$1 AND c.check_in_status='Checked In' AND c.check_out_status='Checked Out'
        `,[parkingLot_id]);

        const ratings = await pool.query(`
            SELECT COUNT(*) AS total,
                   COALESCE(AVG(rating.score),0) AS average
            FROM ratings rating
            JOIN reservations r ON rating.reservation_id=r.reservation_id
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            WHERE s.parkingLot_id=$1
        `,[parkingLot_id]);

        const n = x => Number(x.rows[0].total);

        res.json({
            data:{
                total_reservations:n(reservations),
                completed_reservations:n(completedReservations),
                current_parking:n(currentParking),
                waiting_queue:n(queue),
                revenue:n(revenue),
                total_ratings:n(ratings),
                average_rating:Number(ratings.rows[0].average)
            }
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"ไม่สามารถดึง Report ได้"});
    }
};

export const getUsageAnalysis = async (req,res) => {
    try {
        const {user_id,parkingLot_id} = req.query;

        const manager = await pool.query(`
            SELECT *
            FROM parkingLotManagers
            WHERE user_id=$1 AND parkingLot_id=$2
        `,[user_id,parkingLot_id]);

        if (!manager.rows.length)
            return res.status(403).json({
                message:"คุณไม่ได้เป็น Manager ของลานจอดนี้"
            });

        const totalUsage = await pool.query(`
            SELECT COUNT(*) AS total
            FROM check_in_outs c
            JOIN reservations r ON c.reservation_id=r.reservation_id
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            WHERE s.parkingLot_id=$1 AND c.check_in_status='Checked In'
        `,[parkingLot_id]);

        const popularSlot = await pool.query(`
            SELECT s.parkingSlot_name,COUNT(*) AS usage_count
            FROM check_in_outs c
            JOIN reservations r ON c.reservation_id=r.reservation_id
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            WHERE s.parkingLot_id=$1 AND c.check_in_status='Checked In'
            GROUP BY s.parkingSlot_id,s.parkingSlot_name
            ORDER BY usage_count DESC
            LIMIT 1
        `,[parkingLot_id]);

        const usageByHour = await pool.query(`
            SELECT EXTRACT(HOUR FROM c.check_in_at) AS hour,
                   COUNT(*) AS usage_count
            FROM check_in_outs c
            JOIN reservations r ON c.reservation_id=r.reservation_id
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            WHERE s.parkingLot_id=$1 AND c.check_in_status='Checked In' AND c.check_in_at IS NOT NULL
            GROUP BY EXTRACT(HOUR FROM c.check_in_at)
            ORDER BY usage_count DESC
            LIMIT 1
        `,[parkingLot_id]);

        const popular = popularSlot.rows[0];
        const hour = usageByHour.rows[0];

        res.json({
            data:{
                total_usage:Number(totalUsage.rows[0].total),
                popular_slot:popular ? {
                    parkingSlot_name:popular.parkingSlot_name,
                    usage_count:Number(popular.usage_count)
                } : null,
                popular_hour:hour ? {
                    hour:Number(hour.hour),
                    usage_count:Number(hour.usage_count)
                } : null
            }
        });
    } catch(error) {
        console.error("Usage Analysis Error:",error);
        res.status(500).json({message:"ไม่สามารถวิเคราะห์การใช้งานได้"});
    }
};

export const getSatisfactionAnalysis = async (req,res) => {
    try {
        const {user_id,parkingLot_id} = req.query;

        const manager = await pool.query(`
            SELECT *
            FROM parkingLotManagers
            WHERE user_id=$1 AND parkingLot_id=$2
        `,[user_id,parkingLot_id]);

        if (!manager.rows.length)
            return res.status(403).json({
                message:"คุณไม่ได้เป็น Manager ของลานจอดนี้"
            });

        const summary = await pool.query(`
            SELECT COUNT(*) AS total_ratings,
                   COALESCE(AVG(rating.score),0) AS average_rating
            FROM ratings rating
            JOIN reservations r ON rating.reservation_id=r.reservation_id
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            WHERE s.parkingLot_id=$1
        `,[parkingLot_id]);

        const scoreCount = await pool.query(`
            SELECT rating.score,COUNT(*) AS total
            FROM ratings rating
            JOIN reservations r ON rating.reservation_id=r.reservation_id
            JOIN parkingSlots s ON r.parkingSlot_id=s.parkingSlot_id
            WHERE s.parkingLot_id=$1
            GROUP BY rating.score
            ORDER BY rating.score DESC
        `,[parkingLot_id]);

        const scores = {5:0,4:0,3:0,2:0,1:0};

        scoreCount.rows.forEach(item => {
            scores[item.score]=Number(item.total);
        });

        res.json({
            data:{
                total_ratings:Number(summary.rows[0].total_ratings),
                average_rating:Number(summary.rows[0].average_rating),
                five_star:scores[5],
                four_star:scores[4],
                three_star:scores[3],
                two_star:scores[2],
                one_star:scores[1]
            }
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({message:"ไม่สามารถวิเคราะห์ความพึงพอใจได้"});
    }
};

export const getRealTimeDashboard = async (req,res) => {
    try {
        const {user_id,parkingLot_id} = req.query;

        const manager = await pool.query(`
            SELECT *
            FROM parkingLotManagers
            WHERE user_id=$1 AND parkingLot_id=$2
        `,[user_id,parkingLot_id]);

        if (!manager.rows.length)
            return res.status(403).json({
                message:"คุณไม่ได้เป็น Manager ของลานจอดนี้"
            });

        const totalSlots = await pool.query(`
            SELECT COUNT(*) AS total
            FROM parkingSlots
            WHERE parkingLot_id=$1
        `,[parkingLot_id]);

        const availableSlots = await pool.query(`
            SELECT COUNT(*) AS total
            FROM parkingSlots
            WHERE parkingLot_id=$1 AND status='Available'
        `,[parkingLot_id]);

        const reservedSlots = await pool.query(`
            SELECT COUNT(*) AS total
            FROM parkingSlots
            WHERE parkingLot_id=$1 AND status='Reserved'
        `,[parkingLot_id]);

        const occupiedSlots = await pool.query(`
            SELECT COUNT(*) AS total
            FROM parkingSlots
            WHERE parkingLot_id=$1 AND status='Occupied'
        `,[parkingLot_id]);

        const waitingQueue = await pool.query(`
            SELECT COUNT(*) AS total
            FROM queues
            WHERE parkingLot_id=$1 AND status='Waiting'
        `,[parkingLot_id]);

        const n = x => Number(x.rows[0].total);

        res.json({
            data:{
                total_slots:n(totalSlots),
                available_slots:n(availableSlots),
                reserved_slots:n(reservedSlots),
                occupied_slots:n(occupiedSlots),
                waiting_queue:n(waitingQueue)
            }
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({
            message:"ไม่สามารถดึง Real-time Dashboard ได้"
        });
    }
};