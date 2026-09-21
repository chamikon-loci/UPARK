import pool from "../database/db.js";

export const getTransactions = async (req, res) => {
    try {
        const { user_id } = req.query;
        const transactions = await pool.query(`
            SELECT
                t.transaction_id,
                t.transaction_type,
                t.amount,
                t.slip_ref,
                t.created_at
            FROM transactions t
            JOIN wallets w ON t.wallet_id = w.wallet_id
            WHERE w.user_id = $1
            ORDER BY t.created_at DESC
        `, [user_id]);

        res.status(200).json({data: transactions.rows});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "ไม่สามารถดึงประวัติ Transaction ได้"});
    }
};