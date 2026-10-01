import bcrypt from 'bcryptjs';
import pool from '../database/db.js';
import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET);
};

export const register = async (req,res) => {
    const { first_name, last_name, email, phone_number, username, password } = req.body;

    if(!first_name || !last_name || !email || !phone_number || !username || !password) {
        return res.status(400).json({message: 'โปรดกรอข้อมูลให้ครบ'});
    }

    const existEmail =  await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if(existEmail.rows.length > 0) return res.status(400).json({message: 'ที่อยู่อีเมลซ้ำ'});

    const existUsername = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    if(existUsername.rows.length > 0) return res.status(400).json({message: 'ชื่อผู้ใช้ซ้ำ'});

    const hashed_password = await bcrypt.hash(password, 10);

    const newUser = await pool.query(`INSERT INTO users (first_name, last_name, email, username, password, phone_number, role_name)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id, first_name, last_name, email, username, phone_number, role_name
    `, [first_name, last_name, email, username, hashed_password, phone_number, 'Customer']);

    if(newUser.rows.length > 0) {
        await pool.query(`INSERT INTO wallets (balance, user_id) VALUES (0, $1)`, [newUser.rows[0].user_id]);
    } else {
        return res.json({message: 'บางอย่างผิดพลาด ไม่พบผู้ใช้ที่เพิ่งสมัคร'});
    }
    
    res.status(201).json({message: 'ลงทะเบียนสำเร็จ!', user: newUser.rows[0]}); 
};


export const login = async (req,res) => {
    const { username, password } = req.body;

    if(!username || !password) return res.status(400).json({message: 'โปรดกรอกข้อมูลให้ครบ'});

    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if(user.rows.length === 0) return res.status(404).json({message: 'ไม่พบผู้ใช้'});

    const passwordCompare = await bcrypt.compare(password, user.rows[0].password);
    if(!passwordCompare) return res.status(400).json({message: 'รหัสผ่านไม่ถูกต้อง'});
    
    const token = generateToken(user.rows[0].user_id);
    res.cookie('token', token);

    res.status(200).json({message: 'ลงชื่อเข้าใช้สำเร็จ!', user: { 
        user_id: user.rows[0].user_id, 
        first_name: user.rows[0].first_name,
        last_name: user.rows[0].last_name,
        email: user.rows[0].email,
        username: user.rows[0].username,
        phone_number: user.rows[0].phone_number,
        role_name: user.rows[0].role_name
    }});
};

export const logout = async (req,res) => {
    res.clearCookie('token');
    res.status(200).json({message: 'ลงชื่อออกสำเร็จ!'});
};

export const currentUser = async (req,res) => {
    res.json(req.user);
};
