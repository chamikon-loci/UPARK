import axios from "axios";
import { useEffect, useState } from "react";
import '../styles/parking.css'

const Parking = ({ user }) => {
    const [parkingHistory, setParkingHistory] = useState([]);

    useEffect(() => {
        if (!user) return;

        const getParkingHistory = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/reservation/getParkingHistory?user_id=${user.user_id}`, { withCredentials: true });
                setParkingHistory(res.data.data);
            } catch (error) {
                console.log("ดึง Parking History ไม่สำเร็จ", error);
            }
        };

        getParkingHistory();
    }, [user]);

    if (!user) {
        return <div>กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="parking-container">
            <h1>Parking History</h1>
            <p className="parking-user">ประวัติการจอดรถของ {user.username}</p>

            {parkingHistory.length === 0 ? (
                <div className="no-parking">ยังไม่มีประวัติการจอดรถ</div>
            ) : (
                <div className="parking-list">
                    {parkingHistory.map((parking) => (
                        <div className="parking-card" key={parking.reservation_id}>
                            <h3 style={{backgroundColor: 'white'}}>Parking #{parking.reservation_id}</h3>
                            <p className="parking-info" style={{backgroundColor: 'white'}}><strong style={{backgroundColor: 'white'}}>รถ:</strong> {parking.car_brand} {parking.car_model}</p>
                            <p className="parking-info" style={{backgroundColor: 'white'}}><strong style={{backgroundColor: 'white'}}>ทะเบียน:</strong> {parking.license_plate}</p>
                            <p className="parking-info" style={{backgroundColor: 'white'}}><strong style={{backgroundColor: 'white'}}>ลาน:</strong> {parking.parkinglot_name}</p>
                            <p className="parking-info" style={{backgroundColor: 'white'}}><strong style={{backgroundColor: 'white'}}>ช่อง:</strong> {parking.parkingslot_name}</p>
                            <p className="parking-info" style={{backgroundColor: 'white'}}><strong style={{backgroundColor: 'white'}}>Check In:</strong> {new Date(parking.check_in_at).toLocaleString()}</p>
                            <p className="parking-info" style={{backgroundColor: 'white'}}><strong style={{backgroundColor: 'white'}}>Check Out:</strong> {new Date(parking.check_out_at).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Parking