import pool from "../database/db.js";

export const addCar = async (req, res) => {
    const { car_brand, car_model, color, license_plate, province, user_id } = req.body;

    if(!car_brand || !car_model || !color || !license_plate || !province || !user_id)
        return res.status(400).json({message: 'ข้อมูลไม่ครบ'});

    const newCar = await pool.query(`INSERT INTO vechicles (car_brand, car_model, color, license_plate, province, user_id)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [car_brand, car_model, color, license_plate, province, user_id]);   

    if(newCar.rows.length > 0) 
        res.status(201).json({message: 'บันทึกข้อมูลรถสำเร็จ'});
}

export const getCar = async (req, res) => {

    const car = await pool.query(`SELECT * FROM vechicles`);
    res.json({car: car.rows});
}