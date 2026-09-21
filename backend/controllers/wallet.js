import pool from "../database/db.js";
import { createSCBQR, confirmRef } from "../SCB/service.js";

export const getWallet = async (req, res) => {
    const wallet = await pool.query(`SELECT * FROM wallets`);
    res.json({ data: wallet.rows });
};

export const createQR = async (req, res) => {
    const { amount } = req.body;
    const topUpAmount = Number(amount);

    const QR = await createSCBQR(topUpAmount);

    if (QR) {
        res.json({ data: QR.data.qrImage });
    } else {
        res.status(400).json({ message: "สร้าง QR ไม่สำเร็จ" });
    }
};

export const confirmTopup = async (req, res) => {
    const { myRef, user_id, amount } = req.body;

    const oldTransaction = await pool.query(`
        SELECT transaction_id
        FROM transactions
        WHERE slip_ref = $1
    `, [myRef]);

    if (oldTransaction.rows.length > 0)
        return res.status(400).json({
            message: "รายการเติมเงินนี้ถูกใช้ไปแล้ว"
        });

    const theRef = await confirmRef(myRef);

    if (theRef.data.transRef === myRef) {
        const updated = await pool.query(
            `UPDATE wallets
             SET balance = balance + $1
             WHERE user_id = $2
             RETURNING *`,
            [amount, user_id]
        );

        await pool.query(
            `INSERT INTO transactions
            (wallet_id, transaction_type, amount, slip_ref, created_at)
            VALUES ($1, $2, $3, $4, NOW())`,
            [updated.rows[0].wallet_id, "Top Up", amount, myRef]
        );

        res.status(200).json({
            message: "เติมเงินสำเร็จ",
            updated: updated.rows[0]
        });
    }
};