import jwt from 'jsonwebtoken';
import pool from '../database/db.js';

export const protect = async (req,res, next) => {
    try {

        const token = req.cookies.token;

        if(!token) return res.status(401).json({message: 'ไม่อนุญาตเพราะไม่พบ Token'})
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.id])

        if(user.rows.length === 0) return res.status(401).json({message: 'ไม่พบผู้ใช้'});

        req.user = user.rows[0];
        next();

    } catch (error) {
        console.error(error);
        res.status(401).json({message: 'ไม่อนุญาตเพราะการเข้าถึง Token ไม่สามารถทำได้ ขอโทษด้วย'})
    }
};