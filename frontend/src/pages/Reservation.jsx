import axios from "axios";
import { useEffect, useState } from "react";
import '../styles/reservation.css';

const Reservation = ({ user }) => {
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        if (!user) return;

        const getReservations = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:8080/api/reservation/getReservations?user_id=${user.user_id}`,
                    { withCredentials: true }
                );
                setReservations(res.data.data);
            } catch (error) {
                console.log("ดึง Reservation ไม่สำเร็จ", error);
            }
        };

        getReservations();
    }, [user]);

    const handleCancel = async (reservation_id) => {
        if (!window.confirm("คุณต้องการยกเลิกการจองนี้หรือไม่?")) return;

        try {
            const res = await axios.post(
                'http://localhost:8080/api/reservation/cancel',
                { reservation_id, user_id: user.user_id },
                { withCredentials: true }
            );

            alert(res.data.message);
            setReservations(reservations.filter(r => r.reservation_id !== reservation_id));
        } catch (error) {
            console.log(error.response?.data?.message);
            alert(error.response?.data?.message);
        }
    };

    if (!user) return <div>กำลังโหลดข้อมูล...</div>;

    return (
        <div className="reservation-container">
            <h1>My Reservations</h1>
            <p className="reservation-user">การจองของ {user.username}</p>

            {reservations.length === 0 ? (
                <div className="no-reservation">ยังไม่มี Reservation</div>
            ) : (
                <div className="reservation-list">
                    {reservations.map((reservation) => (
                        <div className="reservation-card" key={reservation.reservation_id}>
                            <h3 style={{ backgroundColor: "white" }}>
                                Reservation #{reservation.reservation_id}
                            </h3>

                            <p className="reservation-info">
                                <strong style={{ backgroundColor: "white" }}>รถ:</strong> {reservation.car_brand} {reservation.car_model}
                            </p>
                            <p className="reservation-info">
                                <strong style={{ backgroundColor: "white" }}>ทะเบียน:</strong> {reservation.license_plate}
                            </p>
                            <p className="reservation-info">
                                <strong style={{ backgroundColor: "white" }}>ลาน:</strong> {reservation.parkinglot_name}
                            </p>
                            <p className="reservation-info">
                                <strong style={{ backgroundColor: "white" }}>ช่อง:</strong> {reservation.parkingslot_name}
                            </p>
                            <p className="reservation-info">
                                <strong style={{ backgroundColor: "white" }}>Start:</strong> {new Date(reservation.start_time).toLocaleString()}
                            </p>
                            <p className="reservation-info">
                                <strong style={{ backgroundColor: "white" }}>End:</strong> {new Date(reservation.end_time).toLocaleString()}
                            </p>
                            <p className="reservation-info">
                                <strong style={{ backgroundColor: "white" }}>Deposit:</strong> {reservation.advance_deposit} บาท
                            </p>

                            {!reservation.check_in_status && (
                                <button onClick={() => handleCancel(reservation.reservation_id)}>
                                    ยกเลิกการจอง
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reservation;