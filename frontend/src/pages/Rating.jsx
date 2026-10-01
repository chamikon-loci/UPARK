import axios from "axios";
import { useEffect, useState } from "react";

function Rating({ user }) {

    const [reservations, setReservations] = useState([]);
    const [ratings, setRatings] = useState([]);

    const [score, setScore] = useState({});
    const [comment, setComment] = useState({});

    const fetchData = async () => {
        try {
            const reservationRes = await axios.get(`http://localhost:8080/api/reservation/getHistory?user_id=${user.user_id}`,{withCredentials: true});
            const ratingRes = await axios.get(`http://localhost:8080/api/rating/myRatings?user_id=${user.user_id}`,{withCredentials: true});
            setReservations(reservationRes.data.data);
            setRatings(ratingRes.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const alreadyRated = (reservation_id) => {
        return ratings.some(rating => rating.reservation_id === reservation_id);
    };

    const submitRating = async (reservation_id) => {
        try {
            if (!score[reservation_id]) {
                alert("กรุณาเลือกคะแนน");
                return;
            }
            await axios.post("http://localhost:8080/api/rating/create", {user_id: user.user_id, reservation_id: reservation_id, score: score[reservation_id],comment: comment[reservation_id] || ""},{withCredentials: true});
            alert("ให้คะแนนสำเร็จ");
            fetchData();
        } catch (error) {
            alert("ให้คะแนนไม่สำเร็จ");
        }
    };

    return (
        <div>
            <h2>Rating</h2>
            {reservations.length === 0 && (
                <p>ยังไม่มีประวัติการจอด</p>
            )}

            {reservations.map((reservation) => {

                if (reservation.check_out_status !== "Checked Out")
                    return null;

                if (alreadyRated(reservation.reservation_id)) {
                    return (
                        <div key={reservation.reservation_id}>
                            <hr />
                            <h3>{reservation.parkingLot_name}</h3>
                            <p>Reservation ID:{reservation.reservation_id}</p>
                            <p>ให้คะแนนแล้ว</p>
                        </div>
                    );
                }

                return (
                    <div key={reservation.reservation_id}>
                        <hr />
                        <h3>{reservation.parkingLot_name}</h3>
                        <p>ช่องจอด: {reservation.parkingSlot_name}</p>
                        <p>Reservation ID: {reservation.reservation_id}</p>
                        <div>
                            <p>คะแนน</p>
                            {[1, 2, 3, 4, 5].map((number) => (
                                <button key={number} onClick={() => setScore({...score, [reservation.reservation_id]: number})}>{number} ⭐</button>
                            ))}
                        </div>

                        <div>
                            <textarea placeholder="ความคิดเห็น"
                                value={comment[reservation.reservation_id] || ""}
                                onChange={(e) => setComment({...comment, [reservation.reservation_id]: e.target.value})}
                            />

                        </div>
                        <button onClick={() =>submitRating(reservation.reservation_id)}>ส่งคะแนน</button>
                    </div>
                );
            })}

        </div>
    );
}

export default Rating;