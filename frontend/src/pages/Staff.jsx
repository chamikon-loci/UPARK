import axios from "axios";
import { useEffect, useState } from "react";
import '../styles/staff.css';

const Staff = ({ user }) => {
    const [licensePlate, setLicensePlate] = useState("");
    const [parkingLots, setParkingLots] = useState([]);
    const [parkingSlots, setParkingSlots] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [currentParking, setCurrentParking] = useState([]);
    const [showParkingSlots, setShowParkingSlots] = useState(false);
    const [showReservations, setShowReservations] = useState(false);

    const getParkingData = async () => {
        try {
            const [lotRes, slotRes, reservationRes, currentParkingRes] = await Promise.all([
                axios.get(`http://localhost:8080/api/staff/getParkingLot?user_id=${user.user_id}`, { withCredentials: true }),
                axios.get(`http://localhost:8080/api/staff/getParkingSlots?user_id=${user.user_id}`, { withCredentials: true }),
                axios.get(`http://localhost:8080/api/staff/getReservations?user_id=${user.user_id}`, { withCredentials: true }),
                axios.get(`http://localhost:8080/api/staff/getCurrentParking?user_id=${user.user_id}`, { withCredentials: true })
            ]);

            setParkingLots(lotRes.data.data);
            setParkingSlots(slotRes.data.data);
            setReservations(reservationRes.data.data);
            setCurrentParking(currentParkingRes.data.data);
        } catch (error) {
            console.log("ดึงข้อมูล Staff ไม่สำเร็จ", error);
        }
    };

    useEffect(() => {
        if (!user) return;
        getParkingData();
    }, [user]);

    const changeSlotStatus = async (parkingSlot_id, status) => {
        try {
            const res = await axios.put(
                "http://localhost:8080/api/staff/changeSlotStatus",
                { parkingSlot_id, user_id: user.user_id, status },
                { withCredentials: true }
            );
            alert(res.data.message);
            getParkingData();
        } catch (error) {
            console.log(error.response?.data?.message);
            alert(error.response?.data?.message || "เปลี่ยนสถานะช่องจอดไม่สำเร็จ");
        }
    };

    const checkIn = async () => {
        try {
            const res = await axios.post(
                "http://localhost:8080/api/staff/checkin",
                { license_plate: licensePlate, user_id: user.user_id },
                { withCredentials: true }
            );
            alert(res.data.message);
            setLicensePlate("");
            getParkingData();
        } catch (error) {
            console.log("Check In Error:", error);
            alert(error.response?.data?.message || "Check In ไม่สำเร็จ");
        }
    };

    const checkOut = async () => {
        try {
            const res = await axios.post(
                "http://localhost:8080/api/staff/checkout",
                { license_plate: licensePlate, user_id: user.user_id },
                { withCredentials: true }
            );
            alert(
                `${res.data.message}\n` +
                `เวลาจอง: ${res.data.reserved_hours} ชั่วโมง\n` +
                `เวลาล่วงเวลา: ${res.data.overtime_hours} ชั่วโมง\n` +
                `ค่าจอดทั้งหมด: ${res.data.total_price} บาท\n` +
                `เงินมัดจำ: ${res.data.advance_deposit} บาท\n` +
                `จ่ายเพิ่ม: ${res.data.remaining} บาท`
            );
            setLicensePlate("");
            getParkingData();
        } catch (error) {
            console.log("Check Out Error:", error);
            alert(error.response?.data?.message || "Check Out ไม่สำเร็จ");
        }
    };

    if (!user) return <div>กำลังโหลดข้อมูล...</div>;

    return (
        <div className="staff-container">
            <h2 className="staff-title">PARKING</h2>

            <div className="staff-box">
                <h1>Staff</h1>
                <p className="staff-description">จัดการลานจอดและการเข้าออกของรถ</p>

                {/* ลานจอดที่รับผิดชอบ */}
                <div className="parking-lot-section">
                    <h2>ลานจอดที่รับผิดชอบ</h2>
                    {parkingLots.length === 0 ? (
                        <p>ยังไม่มีลานจอดที่รับผิดชอบ</p>
                    ) : (
                        parkingLots.map(lot => (
                            <div className="parking-lot-card" key={lot.parkinglot_id}>
                                <h3>{lot.parkinglot_name}</h3>
                                <p>เวลาเปิด: {new Date(lot.open_time).toLocaleTimeString()}</p>
                                <p>เวลาปิด: {new Date(lot.close_time).toLocaleTimeString()}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* ช่องจอด */}
                <div className="parking-slot-section">
                    <div className="section-header">
                        <h2>ช่องจอด</h2>
                        <button className="section-toggle" onClick={() => setShowParkingSlots(!showParkingSlots)}>
                            {showParkingSlots ? "ซ่อนช่องจอด" : "แสดงช่องจอด"}
                        </button>
                    </div>

                    {showParkingSlots && (
                        parkingSlots.length === 0 ? (
                            <p>ยังไม่มีช่องจอด</p>
                        ) : (
                            parkingSlots.map(slot => (
                                <div className="parking-slot-card" key={slot.parkingslot_id}>
                                    <div>
                                        <h3>{slot.parkingslot_name}</h3>
                                        <p>ลาน: {slot.parkinglot_name}</p>
                                        <p>สถานะ: {slot.status}</p>
                                    </div>
                                    {slot.status === "Available" && (
                                        <button onClick={() => changeSlotStatus(slot.parkingslot_id, "Closed")}>
                                            ปิดช่องจอด
                                        </button>
                                    )}
                                    {slot.status === "Closed" && (
                                        <button onClick={() => changeSlotStatus(slot.parkingslot_id, "Available")}>
                                            เปิดช่องจอด
                                        </button>
                                    )}
                                </div>
                            ))
                        )
                    )}
                </div>

                {/* Reservation */}
                <div className="reservation-section">
                    <div className="section-header">
                        <h2>Reservation</h2>
                        <button className="section-toggle" onClick={() => setShowReservations(!showReservations)}>
                            {showReservations ? "ซ่อน Reservation" : "แสดง Reservation"}
                        </button>
                    </div>

                    {showReservations && (
                        reservations.length === 0 ? (
                            <p>ยังไม่มี Reservation</p>
                        ) : (
                            reservations.map(reservation => (
                                <div className="reservation-card" key={reservation.reservation_id}>
                                    <h3>Reservation #{reservation.reservation_id}</h3>
                                    <p>รถ: {reservation.car_brand} {reservation.car_model}</p>
                                    <p>ทะเบียน: {reservation.license_plate}</p>
                                    <p>จังหวัด: {reservation.province}</p>
                                    <p>ลาน: {reservation.parkinglot_name}</p>
                                    <p>ช่องจอด: {reservation.parkingslot_name}</p>
                                    <p>เวลาเริ่ม: {new Date(reservation.start_time).toLocaleString()}</p>
                                    <p>เวลาสิ้นสุด: {new Date(reservation.end_time).toLocaleString()}</p>
                                    <p>Check In: {reservation.check_in_status || "ยังไม่ Check In"}</p>
                                    <p>Check Out: {reservation.check_out_status || "ยังไม่ Check Out"}</p>
                                </div>
                            ))
                        )
                    )}
                </div>

                {/* รถที่กำลังจอด */}
                <div className="current-parking-section">
                    <h2>รถที่กำลังจอด</h2>
                    {currentParking.length === 0 ? (
                        <p>ขณะนี้ไม่มีรถกำลังจอด</p>
                    ) : (
                        currentParking.map(parking => (
                            <div className="current-parking-card" key={parking.reservation_id}>
                                <h3>{parking.car_brand} {parking.car_model}</h3>
                                <p>ทะเบียน: {parking.license_plate}</p>
                                <p>จังหวัด: {parking.province}</p>
                                <p>ลาน: {parking.parkinglot_name}</p>
                                <p>ช่องจอด: {parking.parkingslot_name}</p>
                                <p>Check In: {new Date(parking.check_in_at).toLocaleString()}</p>
                                <p>เวลาจองสิ้นสุด: {new Date(parking.end_time).toLocaleString()}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Check In / Check Out Form */}
                <div className="staff-form">
                    <h2>Check In / Check Out</h2>
                    <p className="input-title">License Plate</p>
                    <input
                        placeholder="เลขทะเบียนรถ"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                    />
                    <div className="staff-buttons">
                        <button className="checkin-button" onClick={checkIn}>Check In</button>
                        <button className="checkout-button" onClick={checkOut}>Check Out</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Staff;