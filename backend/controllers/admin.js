import pool from "../database/db.js";

export const getallusers = async (req, res) => {
    const users = await pool.query(`SELECT * FROM users`);
    res.json({ data: users.rows });
};

export const changeRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    await pool.query(
        `UPDATE users SET role_name = $1 WHERE user_id = $2`,
        [role, id]
    );

    res.json({ message: "เปลี่ยน Role สำเร็จ" });
};