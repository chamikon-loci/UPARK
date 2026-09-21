import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/home.css'

const Home = ({user}) => {
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [parkingLot, setParkingLot] = useState([]);
    const [currentParking, setCurrentParking] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!user) return;

        const getCurrentParking = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:8080/api/reservation/getCurrentParking?user_id=${user.user_id}`,
                    { withCredentials: true }
                );

                setCurrentParking(res.data.data);
            } catch (error) {
                console.log("ดึง Current Parking ไม่สำเร็จ", error);
            }
        };

        getCurrentParking();
    }, [user]);

    useEffect(() => {
        if (!currentParking) {
            setTimeLeft('');
            return;
        }

        const calculateTimeLeft = () => {
            const end = new Date(currentParking.end_time);
            const now = new Date();

            const difference = end - now;

            if (difference <= 0) {
                setTimeLeft('หมดเวลาจอด');
                return;
            }

            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor(
                (difference % (1000 * 60 * 60)) / (1000 * 60)
            );

            setTimeLeft(`${hours} ชั่วโมง ${minutes} นาที`);
        };

        calculateTimeLeft();

        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [currentParking]);

    const handleLogout = async () => {
        try {
            const res = await axios.post('http://localhost:8080/api/auth/logout', {}, { withCredentials: true });
            console.log(`${res.data.message}`);
            navigate('/');
        } catch (error) {
            console.log('ผิดพลาด Logout ไม่ได้');
        }
    }
    
    const handleSearch = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.get(`http://localhost:8080/api/parkingLot/search?keyword=${search}`, {withCredentials:true});
            const result = res.data.data;
            console.log('ลานจอดที่พบ', result);
            setParkingLot(res.data.data);
            navigate('/home/parkingLot', {state: { parkingLot: result }})
        } catch (error) {
            console.log('error is: ', error);
        }
    }

    if (!user) {
        return <div>กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="home-container">
            <div className="home-header">
                <h2>PARKING</h2>
                <p>Find your parking space</p>
            </div>

            <div className="home-box">
                <h1>ยินดีต้อนรับคุณ {user.username}</h1>

                <p className="home-description">
                    จัดการข้อมูลและค้นหาลานจอดรถของคุณ
                </p>

                <div className="home-buttons">
                    <button onClick={() => navigate('/home/wallet')}>
                        Your Wallet
                    </button>

                    <button onClick={() => navigate('/home/carinfo')}>
                        Your Car
                    </button>

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>

                <div className="home-menu">
                    <button onClick={() => navigate('/home/transaction')}>
                        Transaction History
                    </button>

                    <button onClick={() => navigate('/home/reservation')}>
                        My Reservations
                    </button>

                    <button onClick={() => navigate('/home/parking')}>
                        Parking History
                    </button>
                </div>

                <div className="current-parking">
                    <p className="section-title">Current Parking</p>

                    <div className="current-parking-box">
                        {
                            currentParking ? (
                                <>
                                    <p style={{backgroundColor: '#FAFAFA'}}>
                                        <strong style={{backgroundColor: '#FAFAFA'}}>สถานะ:</strong> กำลังจอด
                                    </p>

                                    <p style={{backgroundColor: '#FAFAFA'}}>
                                        <strong style={{backgroundColor: '#FAFAFA'}}>รถ:</strong> {currentParking.car_brand} {currentParking.car_model}
                                    </p>

                                    <p style={{backgroundColor: '#FAFAFA'}}>
                                        <strong style={{backgroundColor: '#FAFAFA'}}>ทะเบียน:</strong> {currentParking.license_plate}
                                    </p>

                                    <p style={{backgroundColor: '#FAFAFA'}}>
                                        <strong style={{backgroundColor: '#FAFAFA'}}>ลาน:</strong> {currentParking.parkinglot_name}
                                    </p>

                                    <p style={{backgroundColor: '#FAFAFA'}}>
                                        <strong style={{backgroundColor: '#FAFAFA'}}>ช่อง:</strong> {currentParking.parkingslot_name}
                                    </p>

                                    <p style={{backgroundColor: '#FAFAFA'}}>
                                        <strong style={{backgroundColor: '#FAFAFA'}}>เวลาสิ้นสุด:</strong>{" "}
                                        {new Date(currentParking.end_time).toLocaleString()}
                                    </p>

                                    <p style={{backgroundColor: '#FAFAFA'}}>
                                        <strong style={{backgroundColor: '#FAFAFA'}}>เวลาคงเหลือ:</strong> {timeLeft}
                                    </p>
                                </>
                            ) : (
                                <p className="no-parking">
                                    ตอนนี้คุณไม่ได้กำลังจอดรถ
                                </p>
                            )
                        }
                    </div>
                </div>

                <form onSubmit={handleSearch} className="search-form">
                    <p className="search-title">Find a Parking Lot</p>

                    <input
                        placeholder="ค้นหาลานจอด"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        required
                    />

                    <button>ค้นหาลานจอด</button>
                </form>

            </div>
        </div>
    )
}

export default Home;