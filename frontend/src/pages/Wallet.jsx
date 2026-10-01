import { useState } from "react";
import axios from "axios";
import '../styles/wallet.css'

const Wallet = ({user, wallet}) => {

    if (!wallet) {
        return <div>กำลังโหลดข้อมูล...</div>;
    }

    const yourWallet = wallet.filter(thewallet => thewallet.user_id === user.user_id);

    const [amount, setAmount] =useState('');
    const [QRCode, setQRCode] = useState(null);
    const [ref, setRef] = useState('');
    const [current, setCurrent] = useState(yourWallet[0].balance);

    const [error, setError] = useState('')

    const handleTopup = async (e) => {
        e.preventDefault();

        const res = await axios.post('http://localhost:8080/api/wallet/topup', {amount: amount}, { withCredentials: true });
        setQRCode(res.data.data);
    }

    const handleRef = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('http://localhost:8080/api/wallet/confirm', { myRef: ref, user_id: user.user_id, amount: amount }, { withCredentials: true });
            setCurrent(() => Number(res.data.updated.balance));
        } catch (error) {
            setError("เติมเงินไม่สำเร็จ")
        }
    }

    if(wallet.length > 0){
        return (
            <div className="wallet-container">
                <h2 className="wallet-title">PARKING</h2>
                <div className="wallet-box">
                    <p className="wallet-label">Your Balance</p>
                    <h1 className="balance">฿{current}</h1>

                    <div className="topup-section">
                        <p className="section-title">Top Up Wallet</p>
                        <form onSubmit={handleTopup}>
                            <input required type='number' placeholder="จำนวนเงิน" value={amount} onChange={(e) => setAmount(e.target.value)} />
                            <button>เติมเงิน</button>
                        </form>
                    </div>

                    {QRCode && <div className="qr-section">
                        <p className="section-title">Scan QR Code</p>
                        <img className="qr-code" src={`data:image/png;base64,${QRCode}`}/> 
                        <br />
                        {error && <p style={{backgroundColor: 'white'}}>{error}</p>}
                        <form onSubmit={handleRef}>
                            <input placeholder="กรอกรหัส Reference" value={ref} onChange={(e) => setRef(e.target.value)}/>
                            <button>ยืนยัน</button>
                        </form>
                        </div>
                    }
                </div>
            </div>
        )
    }

    return (
        <div className="wallet-container">
            <div className="wallet-box">
                <h1>หน้า Wallet</h1>
            </div>
        </div>
    )
};

export default Wallet;
