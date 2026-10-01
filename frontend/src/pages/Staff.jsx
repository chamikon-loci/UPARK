import axios from "axios";
import { useEffect, useState } from "react";
import '../styles/staff.css';

const Staff = ({ user }) => {
    const [parkingLots, setParkingLots] = useState([]);
    const [parkingSlots, setParkingSlots] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [currentParking, setCurrentParking] = useState([]);
    const [showParkingSlots, setShowParkingSlots] = useState(false);
    const [showReservations, setShowReservations] = useState(false);
    const [announcement, setAnnouncement] = useState("");
    const [pin, setPin] = useState("");
    const [verifiedReservation, setVerifiedReservation] = useState(null);

    const getParkingData = async () => {
        try {
            const lotRes = await axios.get(`http://localhost:8080/api/staff/getParkingLot?user_id=${user.user_id}`, { withCredentials: true });
            const slotRes = await axios.get(`http://localhost:8080/api/staff/getParkingSlots?user_id=${user.user_id}`, { withCredentials: true });
            const reservationRes = await axios.get(`http://localhost:8080/api/staff/getReservations?user_id=${user.user_id}`, { withCredentials: true });
            const currentParkingRes = await axios.get(`http://localhost:8080/api/staff/getCurrentParking?user_id=${user.user_id}`, { withCredentials: true });

            setParkingLots(lotRes.data.data);
            setParkingSlots(slotRes.data.data);
            setReservations(reservationRes.data.data);
            setCurrentParking(currentParkingRes.data.data);

        } catch (error) {
            console.log("ดึงข้อมูล Staff ไม่สำเร็จ");
        }
    };

    useEffect(() => {
        if (!user) return;
        getParkingData();
    }, [user]);

    const changeSlotStatus = async (parkingSlot_id, status) => {
        try {
            const res = await axios.put("http://localhost:8080/api/staff/changeSlotStatus", { parkingSlot_id, user_id: user.user_id, status }, { withCredentials: true });
            alert(res.data.message);
            getParkingData();
        } catch (error) {
            alert("เปลี่ยนสถานะช่องจอดไม่สำเร็จ");
        }
    };

    const checkIn = async () => {
        try {
            if (!verifiedReservation) {
                alert("กรุณาตรวจสอบ PIN ก่อน");
                return;
            }

            const res = await axios.post("http://localhost:8080/api/staff/checkin", { reservation_id: verifiedReservation.reservation_id, user_id: user.user_id }, { withCredentials: true });
            alert(res.data.message);

            setVerifiedReservation(null);
            setPin("");
            getParkingData();

        } catch (error) {
            alert(error.response?.data?.message || "Check In ไม่สำเร็จ");
        }
    };

    const checkOut = async (licensePlate) => {
        if (!window.confirm(`ยืนยัน Check Out รถทะเบียน ${licensePlate} ?`)) return;

        try {
            const res = await axios.post("http://localhost:8080/api/staff/checkout", { license_plate: licensePlate, user_id: user.user_id }, { withCredentials: true });
            alert(
                `${res.data.message}\n` +
                `เวลาจอง: ${res.data.reserved_hours} ชั่วโมง\n` +
                `เวลาล่วงเวลา: ${res.data.overtime_hours} ชั่วโมง\n` +
                `ค่าจอดทั้งหมด: ${res.data.total_price} บาท\n` +
                `เงินมัดจำ: ${res.data.advance_deposit} บาท\n` +
                `จ่ายเพิ่ม: ${res.data.remaining} บาท`
            );
            getParkingData();
        } catch (error) {
            alert(error.response?.data?.message || "Check Out ไม่สำเร็จ");
        }
    };

    const verifyPin = async () => {
        try {
            const res = await axios.post("http://localhost:8080/api/staff/verifyPin", { pin_code: pin, user_id: user.user_id }, { withCredentials: true });
            setVerifiedReservation(res.data.data);
            alert("PIN ถูกต้อง");
        } catch (error) {
            alert(error.response?.data?.message || "ตรวจสอบ PIN ไม่สำเร็จ");
        }
    };

    const sendAnnouncement = async () => {
        try {
            if (!announcement.trim()) {
                alert("กรุณากรอกข้อความประกาศ");
                return;
            }
            const res = await axios.post("http://localhost:8080/api/staff/announcement", { user_id: user.user_id, message: announcement }, { withCredentials: true });
            alert(res.data.message);
            setAnnouncement("");

        } catch (error) {
            alert("ส่งประกาศไม่สำเร็จ");
        }
    };

    if (!user) return <div>กำลังโหลดข้อมูล...</div>;

    return (
        <div className="staff-container">
            <h2 className="staff-title">PARKING</h2>

            <div className="staff-box">
                <h1>Staff</h1>
                <p className="staff-description">จัดการลานจอดและการเข้าออกของรถ</p>

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

                <div className="staff-form">
                    <h2>Announcement</h2>
                    <p className="input-title"> ข้อความประกาศ</p>

                    <textarea placeholder="กรอกข้อความที่ต้องการประกาศ" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} />

                    <div className="staff-buttons">
                        <button onClick={sendAnnouncement}>ส่งประกาศ</button>
                    </div>
                </div>

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
                                        <button onClick={() => changeSlotStatus(slot.parkingslot_id, "Closed")}>ปิดช่องจอด</button>
                                    )}
                                    {slot.status === "Closed" && (
                                        <button onClick={() => changeSlotStatus(slot.parkingslot_id, "Available")}>เปิดช่องจอด</button>
                                    )}
                                </div>
                            ))
                        )
                    )}
                </div>

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
                                <button className="checkout-button" onClick={() => checkOut(parking.license_plate)}>
                                    Check Out
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div>
                    <h3>PIN Verification</h3>
                    <input type="text" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="กรอก PIN 6 หลัก" maxLength={6} />
                    <button onClick={verifyPin}>ตรวจสอบ PIN</button>
                </div>

                {verifiedReservation && (
                    <div>
                        <h3>Reservation Information</h3>
                        <p>รถ: {verifiedReservation.car_brand} {verifiedReservation.car_model}</p>
                        <p>ทะเบียน: {verifiedReservation.license_plate}</p>
                        <p>ช่องจอด: {verifiedReservation.parkingSlot_name}</p>
                        <p>เวลาเริ่ม: {new Date(verifiedReservation.start_time).toLocaleString()}</p>
                        <p>เวลาสิ้นสุด: {new Date(verifiedReservation.end_time).toLocaleString()}</p>
                        <button onClick={checkIn}>Check In</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Staff;