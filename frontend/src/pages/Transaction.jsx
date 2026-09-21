import axios from "axios";
import { useEffect, useState } from "react";
import '../styles/transaction.css'

const Transaction = ({ user }) => {

    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        if (!user) return;
        const getTransactions = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/transaction/getTransactions?user_id=${user.user_id}`,{ withCredentials: true });
                setTransactions(res.data.data);
            } catch (error) {
                console.log("ดึง Transaction ไม่สำเร็จ", error);
            }
        };
        getTransactions();
    }, [user]);

    if (!user) {
        return <div>กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="transaction-container">
            <h1>Transaction History</h1>
            <p className="transaction-user">ประวัติการทำรายการของ {user.username}</p>
            {transactions.length === 0 ? (
                <div className="no-transaction">ยังไม่มีประวัติการทำรายการ</div>
            ) : (
                <div className="transaction-list">
                    {transactions.map((transaction) => (
                        <div className="transaction-card" key={transaction.transaction_id}>
                            <h3 style={{backgroundColor: 'white'}}>{transaction.transaction_type}</h3>
                            <p className="transaction-info" style={{backgroundColor: 'white'}}><strong style={{backgroundColor: 'white'}}>จำนวนเงิน:</strong> {transaction.amount} บาท</p>
                            <p className="transaction-info" style={{backgroundColor: 'white'}}><strong style={{backgroundColor: 'white'}}>วันที่:</strong> {transaction.created_at}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Transaction;